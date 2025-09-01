import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'order-service' });
});

const PORT = process.env.PORT || 5003;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
});
