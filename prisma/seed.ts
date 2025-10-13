import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create sample products
  const products = [
    {
      name: 'Dental Chair Model A',
      description: 'Professional dental chair with advanced features',
      price: 150000.00,
      image: '/images/dental-chair-a.jpg',
      category: 'reclining',
    },
    {
      name: 'Dental Unit Model B',
      description: 'Complete dental unit with all necessary equipment',
      price: 200000.00,
      image: '/images/dental-unit-b.jpg',
      category: 'units',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      },
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 