const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const teamRoutes = require('./routes/teams');
const requestRoutes = require('./routes/requests');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'GearGuard API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/requests', requestRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to GearGuard API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            authentication: '/api/auth',
            equipment: '/api/equipment',
            teams: '/api/teams',
            requests: '/api/requests',
        },
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
