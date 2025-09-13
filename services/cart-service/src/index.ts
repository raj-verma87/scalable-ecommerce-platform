import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cartRoutes from './routes/cart.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/cart', cartRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cart-service' });
});

const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`));
});
