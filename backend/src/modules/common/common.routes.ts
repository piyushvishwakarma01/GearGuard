import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes for categories and stages (needed for dropdowns)
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/stages', async (req, res, next) => {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { sequence: 'asc' },
    });
    res.json(stages);
  } catch (error) {
    next(error);
  }
});

// Authenticated routes
router.get('/users', authenticate, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
