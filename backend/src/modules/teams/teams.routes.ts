import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { teamSchema } from '../../utils/validators.js';
import { AppError } from '../../middleware/error.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/teams
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
        equipment: { select: { id: true, name: true, serialNumber: true } },
        _count: { select: { maintenanceRequests: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
        equipment: { include: { category: true } },
        maintenanceRequests: {
          include: { stage: true, equipment: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
});

// POST /api/teams
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { name, memberIds } = teamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        name,
        members: memberIds ? { connect: memberIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// PATCH /api/teams/:id
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, memberIds } = teamSchema.partial().parse(req.body);

    const updateData: any = {};
    if (name) updateData.name = name;
    if (memberIds !== undefined) {
      updateData.members = { set: memberIds.map((memberId) => ({ id: memberId })) };
    }

    const team = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.team.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
