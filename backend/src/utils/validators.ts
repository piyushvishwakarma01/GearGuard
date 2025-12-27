import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  serialNumber: z.string().optional(),
  categoryId: z.number().int().positive(),
  department: z.string().optional(),
  teamId: z.number().int().positive().optional(),
  technicianId: z.number().int().positive().optional(),
  employeeName: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const maintenanceRequestSchema = z.object({
  name: z.string().min(1, 'Request name is required'),
  description: z.string().optional(),
  requestType: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  equipmentId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
  teamId: z.number().int().positive().optional(),
  technicianId: z.number().int().positive().optional(),
  stageId: z.number().int().positive(),
  scheduledDate: z.string().datetime().optional(),
  duration: z.number().positive().optional(),
  priority: z.enum(['VERY_LOW', 'LOW', 'NORMAL', 'HIGH', 'VERY_HIGH']).optional(),
});

export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  memberIds: z.array(z.number().int().positive()).optional(),
});
