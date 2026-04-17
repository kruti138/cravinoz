import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './db';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Serve static uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

const rawOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const allowedOrigins = [rawOrigin, 'http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// routes
import authRoutes from './routes/auth';
import pizzaRoutes from './routes/pizzas';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';

app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.get('/', (req, res) => res.send({ message: 'Cravinoz Backend' }));

// Initialize Prisma
prisma.$connect().then(async () => {
  console.log('Database connected');
  // Sanity check
  const userCount = await prisma.user.count();
  console.log(`Verified database: ${userCount} users found.`);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
