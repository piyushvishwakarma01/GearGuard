import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import equipmentRoutes from './modules/equipment/equipment.routes.js';
import teamsRoutes from './modules/teams/teams.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import commonRoutes from './modules/common/common.routes.js';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api', commonRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
  console.log(`🔑 JWT expires in: ${env.JWT_EXPIRES_IN}`);
});

export default app;
