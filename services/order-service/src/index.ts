import express, { Application } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import orderRoutes from './routes/order.routes';
import { errorHandler } from '@shared/middleware/errorHandler';
import { requestLogger } from '@shared/middleware/logger.middleware';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import {logger} from '@shared/utils/logger';
import { requestContext } from '@shared/middleware/requestContext';
import { morganMiddleware } from '../../../shared/src/middleware/morgan.middleware';

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(requestContext);
app.use(requestLogger('order-service'));

// Apply Morgan + Winston middleware
app.use(morganMiddleware);

// Routes
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/health', (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      service: 'order-service',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check failed', err);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

// Global Error Handler
app.use(errorHandler('order-service'));

// Server bootstrap
const PORT = process.env.PORT || 5003;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Order Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Order Service:', err);
    process.exit(1);
  }
})();
