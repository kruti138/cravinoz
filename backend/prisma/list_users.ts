import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Test',
        email: 'test@pizzahub.com',
        password: 'pwd',
      }
    });
    console.log('Created!', user);
  } catch (e: any) {
    console.error('Error creating user:');
    console.error(e.message);
    console.error(e.meta);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
