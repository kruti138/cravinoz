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

app.use(cors({ origin: true }));
app.use(express.json());

// routes
import authRoutes from './routes/auth';
import pizzaRoutes from './routes/pizzas';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send({ message: 'Pizza Ordering Backend' }));

// Initialize Prisma
prisma.$connect().then(() => {
  console.log('Database connected');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
