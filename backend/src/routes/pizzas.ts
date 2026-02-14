import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pizzas = await prisma.pizza.findMany({ where: { available: true } });
    const mapped = pizzas.map((p) => {
      const sizesObj = JSON.parse(p.sizes);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image,
        price: sizesObj?.medium || p.basePrice,
        category: p.category,
        popular: p.popular,
        sizes: sizesObj,
        toppings: JSON.parse(p.toppings),
      };
    });
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.pizza.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ message: 'Pizza not found' });
    const mapped = {
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      price: (p.sizes as any)?.medium || p.basePrice,
      category: p.category,
      popular: p.popular,
      sizes: p.sizes,
      toppings: p.toppings,
    };
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
