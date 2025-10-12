import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import productRoutes from './routes/product.routes';
import { morganMiddleware } from '../../../shared/src/middleware/morgan.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());
app.use('/api/products', productRoutes);

// Apply Morgan + Winston middleware
app.use(morganMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Product Service running on port ${PORT}`);
  });
});
