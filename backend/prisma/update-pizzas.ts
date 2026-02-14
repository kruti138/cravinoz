import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  // Update existing pizzas with images and availability
  const pizzaUpdates = [
    {
      name: 'Margherita',
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop',
    },
    {
      name: 'Pepperoni',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop',
    },
    {
      name: 'Veggie Delight',
      image: 'https://images.unsplash.com/photo-1511594992202-08d2d0b4c4e9?w=400&h=400&fit=crop',
    },
  ];

  for (const update of pizzaUpdates) {
    await prisma.pizza.updateMany({
      where: { name: update.name },
      data: {
        image: update.image,
        available: true,
      },
    });
    console.log(`Updated ${update.name}`);
  }

  console.log('All pizzas updated successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });
