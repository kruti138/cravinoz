import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  // create admin user
  const adminEmail = 'admin@pizzahub.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('adminpass', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashed,
        role: 'ADMIN',
        verified: true,
      },
    });
    console.log('Admin user created. Email:', adminEmail, 'Password: adminpass');
  }

  // create regular user
  const userEmail = 'user@pizzahub.com';
  const userExists = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!userExists) {
    const hashed = await bcrypt.hash('userpass123', 10);
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: userEmail,
        password: hashed,
        phone: '+1234567890',
        role: 'USER',
        verified: true,
      },
    });
    console.log('Regular user created. Email:', userEmail, 'Password: userpass123');
  }

  // Seed some sample pizzas
  const pizzas = [
    {
      name: 'Margherita',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      basePrice: 299,
      sizes: JSON.stringify({ small: 199, medium: 299, large: 399 }),
      toppings: JSON.stringify([]),
      category: 'veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Pepperoni',
      description: 'Spicy pepperoni with mozzarella and tomato sauce',
      basePrice: 349,
      sizes: JSON.stringify({ small: 249, medium: 349, large: 449 }),
      toppings: JSON.stringify([]),
      category: 'non-veg',
      popular: true,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop',
      available: true,
    },
    {
      name: 'Veggie Delight',
      description: 'Loaded with fresh vegetables and cheese',
      basePrice: 329,
      sizes: JSON.stringify({ small: 229, medium: 329, large: 429 }),
      toppings: JSON.stringify([]),
      category: 'veg',
      popular: false,
      image: 'https://images.unsplash.com/photo-1511594992202-08d2d0b4c4e9?w=400&h=400&fit=crop',
      available: true,
    },
  ];

  for (const pizza of pizzas) {
    const exists = await prisma.pizza.findFirst({ where: { name: pizza.name } });
    if (!exists) {
      await prisma.pizza.create({ data: pizza });
      console.log('Created pizza', pizza.name);
    }
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });
