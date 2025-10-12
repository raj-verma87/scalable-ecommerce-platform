import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cartRoutes from './routes/cart.routes';
import { requestContext, errorHandler } from '@shared/middleware';
import { morganMiddleware } from '../../../shared/src/middleware/morgan.middleware';

dotenv.config();

const app = express();
app.use(express.json());
app.use(requestContext);

app.use('/api/cart', cartRoutes);

// Apply Morgan + Winston middleware
app.use(morganMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cart-service' });
});

// Error handler
app.use(errorHandler('cart-service'));

const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`));
});
