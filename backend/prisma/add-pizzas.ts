import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  // Add more pizzas with images
  const newPizzas = [
    {
      name: 'BBQ Chicken',
      description: 'Grilled chicken with BBQ sauce and onions',
      basePrice: 379,
      sizes: JSON.stringify({ small: 279, medium: 379, large: 479 }),
      toppings: JSON.stringify([]),
      category: 'non-veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Paneer Tikka',
      description: 'Spiced paneer chunks with bell peppers',
      basePrice: 359,
      sizes: JSON.stringify({ small: 259, medium: 359, large: 459 }),
      toppings: JSON.stringify([]),
      category: 'veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1511689915661-18d385baecfe?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Garlic Bread Pizza',
      description: 'Cheesy pizza with garlic and herbs',
      basePrice: 309,
      sizes: JSON.stringify({ small: 209, medium: 309, large: 409 }),
      toppings: JSON.stringify([]),
      category: 'veg',
      popular: false,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Meat Lovers',
      description: 'Loaded with chicken, bacon, and sausage',
      basePrice: 429,
      sizes: JSON.stringify({ small: 329, medium: 429, large: 529 }),
      toppings: JSON.stringify([]),
      category: 'non-veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Farmhouse',
      description: 'Corn, peas, mushroom, and fresh herbs',
      basePrice: 319,
      sizes: JSON.stringify({ small: 219, medium: 319, large: 419 }),
      toppings: JSON.stringify([]),
      category: 'veg',
      popular: false,
      image: 'https://images.unsplash.com/photo-1511689915661-18d385baecfe?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Spicy Tandoori',
      description: 'Tandoori paneer and chicken with spices',
      basePrice: 369,
      sizes: JSON.stringify({ small: 269, medium: 369, large: 469 }),
      toppings: JSON.stringify([]),
      category: 'non-veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop',
      available: true,
    },
  ];

  for (const pizza of newPizzas) {
    const exists = await prisma.pizza.findFirst({ where: { name: pizza.name } });
    if (!exists) {
      await prisma.pizza.create({ data: pizza });
      console.log(`Created pizza: ${pizza.name}`);
    } else {
      console.log(`Pizza already exists: ${pizza.name}`);
    }
  }

  // Show all pizzas
  const allPizzas = await prisma.pizza.findMany();
  console.log(`\nTotal pizzas in database: ${allPizzas.length}`);
  allPizzas.forEach(p => {
    console.log(`✓ ${p.name}`);
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });
