import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (_req: any, file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/orders', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      include: { user: true }, 
      orderBy: { createdAt: 'desc' } 
    });
    // Parse items for each order
    const parsedOrders = orders.map((order: any) => ({
      ...order,
      items: JSON.parse(order.items),
    }));
    res.json(parsedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status with timestamp tracking
router.put('/orders/:id/status', authenticate, authorize(['ADMIN']), async (req: any, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Build update data with timestamp tracking
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };

    // Set timestamp when status changes
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    else if (status === 'PREPARING') updateData.preparingAt = new Date();
    else if (status === 'BAKING') updateData.bakingAt = new Date();
    else if (status === 'OUT_FOR_DELIVERY') updateData.outForDeliveryAt = new Date();
    else if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    else if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: true }
    });
    
    const parsedOrder = {
      ...updated,
      items: JSON.parse(updated.items),
    };
    
    res.json(parsedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/pizzas', authenticate, authorize(['ADMIN']), async (req: any, res) => {
  try {
    const data = req.body;
    const pizza = await prisma.pizza.create({
      data: {
        name: data.name,
        description: data.description || '',
        image: data.image || null,
        basePrice: data.basePrice || 0,
        sizes: JSON.stringify(data.sizes || { small: data.basePrice, medium: data.basePrice, large: data.basePrice }),
        toppings: JSON.stringify(data.toppings || []),
        category: data.category || 'veg',
        popular: !!data.popular,
        available: true,
      }
    });
    res.json(pizza);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/pizzas/:id', authenticate, authorize(['ADMIN']), async (req: any, res) => {
  try {
    const data = req.body;
    const updated = await prisma.pizza.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        basePrice: data.basePrice,
        sizes: data.sizes || {},
        toppings: data.toppings || [],
        category: data.category,
        popular: data.popular,
        available: data.available,
        updatedAt: new Date(),
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/pizzas/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    await prisma.pizza.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users
router.get('/users', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, blocked: true }
    });
    const mapped = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, blocked: !!u.blocked }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block / unblock user
router.put('/users/:id/block', authenticate, authorize(['ADMIN']), async (req: any, res) => {
  try {
    const { blocked } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { blocked: !!blocked, updatedAt: new Date() },
      select: { id: true, name: true, email: true, role: true, blocked: true }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload image
router.post('/upload', authenticate, authorize(['ADMIN']), upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Construct absolute URL
  const protocol = req.protocol || 'http';
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;
