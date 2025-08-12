import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from './routes/auth.route';
import errorHandler from "./middlewares/errorHandler";
import { connectRabbitMQ } from './events/publisher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

// Connect DB & Start server
connectDB().then(() => {
    app.listen(PORT, async () => {
        console.log(`Auth Service running on port ${PORT}`);
        try {
            await connectRabbitMQ();
            console.log('RabbitMQ connected');
        } catch (err) {
            console.error('Failed to connect RabbitMQ:', err);
        }

    });
});





