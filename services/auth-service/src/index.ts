import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from './routes/auth.route';
import errorHandler from "./middlewares/errorHandler";
 import { connectRabbitMQ } from './events/publisher';
import jwksRouter from "./routes/jwks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// JWKS endpoint
app.use("/auth", jwksRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});
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





