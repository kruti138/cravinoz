import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  // Get all pizzas to check their status
  const allPizzas = await prisma.pizza.findMany();
  
  console.log('All pizzas in database:');
  allPizzas.forEach(p => {
    console.log(`- ${p.name} | Available: ${p.available} | Image: ${p.image ? 'Yes' : 'No'} | Created: ${p.createdAt}`);
  });

  // Update any pizza that is not available to be available
  const updated = await prisma.pizza.updateMany({
    where: { available: false },
    data: { available: true }
  });

  console.log(`\nUpdated ${updated.count} pizzas to available: true`);

  // Show updated list
  const updatedPizzas = await prisma.pizza.findMany();
  console.log('\nPizzas after update:');
  updatedPizzas.forEach(p => {
    console.log(`- ${p.name} | Available: ${p.available}`);
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });
