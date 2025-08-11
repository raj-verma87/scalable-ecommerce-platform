import express from "express";
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use('/api/users',userRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
});
