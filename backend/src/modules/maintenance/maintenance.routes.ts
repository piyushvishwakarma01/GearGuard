import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { maintenanceRequestSchema } from '../../utils/validators.js';
import { AppError } from '../../middleware/error.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/maintenance
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { equipmentId, teamId, technicianId, stageId, requestType, priority } = req.query;

    const where: any = {};

    if (equipmentId) where.equipmentId = parseInt(equipmentId as string);
    if (teamId) where.teamId = parseInt(teamId as string);
    if (technicianId) where.technicianId = parseInt(technicianId as string);
    if (stageId) where.stageId = parseInt(stageId as string);
    if (requestType) where.requestType = requestType;
    if (priority) where.priority = priority;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        equipment: { include: { category: true } },
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
        stage: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// GET /api/maintenance/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        equipment: { include: { category: true, team: true } },
        category: true,
        team: { include: { members: { select: { id: true, name: true, email: true } } } },
        technician: { select: { id: true, name: true, email: true } },
        stage: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = maintenanceRequestSchema.parse(req.body);

    // Fetch equipment to auto-populate category and team
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
      select: { categoryId: true, teamId: true },
    });

    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        ...data,
        categoryId: data.categoryId || equipment.categoryId,
        teamId: data.teamId || equipment.teamId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        createdById: req.userId!,
      },
      include: {
        equipment: { include: { category: true } },
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
        stage: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// PATCH /api/maintenance/:id
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = maintenanceRequestSchema.partial().parse(req.body);

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
      include: {
        equipment: { include: { category: true } },
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
        stage: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// PATCH /api/maintenance/:id/stage - Update stage (for Kanban drag-drop)
router.patch('/:id/stage', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { stageId } = z.object({ stageId: z.number().int().positive() }).parse(req.body);

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: { stageId },
      include: {
        equipment: true,
        stage: true,
      },
    });

    res.json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.maintenanceRequest.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/maintenance/stats/overview
router.get('/stats/overview', async (req: AuthRequest, res, next) => {
  try {
    const [total, byStage, byPriority, overdue] = await Promise.all([
      prisma.maintenanceRequest.count(),
      prisma.maintenanceRequest.groupBy({
        by: ['stageId'],
        _count: true,
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['priority'],
        _count: true,
      }),
      prisma.maintenanceRequest.count({
        where: {
          scheduledDate: { lt: new Date() },
          stage: { code: { notIn: ['repaired', 'scrap'] } },
        },
      }),
    ]);

    res.json({ total, byStage, byPriority, overdue });
  } catch (error) {
    next(error);
  }
});

export default router;
