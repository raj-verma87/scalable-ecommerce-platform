import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());
app.use('/api/products', productRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Product Service running on port ${PORT}`);
  });
});
