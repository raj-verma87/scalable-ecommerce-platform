import express from "express";
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/user.routes';
import { connectRabbitMQ } from './events/consumer';
import { requestContext, errorHandler } from '@shared/middleware';
import { morganMiddleware } from '../../../shared/src/middleware/morgan.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(requestContext);
app.use('/api/users',userRoutes);

// Apply Morgan + Winston middleware
app.use(morganMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

// Error handler
app.use(errorHandler('user-service'));

connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`User Service running on port ${PORT}`);

    try {
      await connectRabbitMQ();
      console.log('✅ RabbitMQ connected');
    } catch (err) {
      console.error('Failed to connect RabbitMQ:', err);
    }
    
  });

  
});

  
