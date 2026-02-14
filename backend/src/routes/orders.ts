import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Order status enum - All valid order statuses with CANCELLED option
export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

// Create order
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { items, total, payment, address, phone } = req.body;
    if (!items || !total || !address || !phone) return res.status(400).json({ message: 'Missing fields' });
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        items: JSON.stringify(items),
        total,
        payment,
        address,
        phone,
        status: 'PENDING',
      },
      include: { user: true },
    });
    const parsedOrder = {
      ...order,
      items: JSON.parse(order.items),
    };
    res.json(parsedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/user', authenticate, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    const parsedOrders = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));
    res.json(parsedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by id (user must be owner or admin)
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    const parsedOrder = {
      ...order,
      items: JSON.parse(order.items),
    };
    res.json(parsedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

