import express from "express";
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/user.routes';
import { connectRabbitMQ } from './events/consumer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use('/api/users',userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

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

  
