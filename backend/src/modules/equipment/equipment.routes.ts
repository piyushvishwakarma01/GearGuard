import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { equipmentSchema } from '../../utils/validators.js';
import { AppError } from '../../middleware/error.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/equipment
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { categoryId, teamId, technicianId, search } = req.query;

    const where: any = {};

    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (teamId) where.teamId = parseInt(teamId as string);
    if (technicianId) where.technicianId = parseInt(technicianId as string);
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { serialNumber: { contains: search as string } },
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// GET /api/equipment/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        team: { include: { members: { select: { id: true, name: true, email: true } } } },
        technician: { select: { id: true, name: true, email: true } },
        maintenanceRequests: {
          include: { stage: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// POST /api/equipment
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = equipmentSchema.parse(req.body);

    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      },
      include: {
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// PATCH /api/equipment/:id
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = equipmentSchema.partial().parse(req.body);

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      },
      include: {
        category: true,
        team: true,
        technician: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// DELETE /api/equipment/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.equipment.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
