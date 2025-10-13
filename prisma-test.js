const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Try to create a product with stock
  try {
    const product = await prisma.product.create({
      data: {
        name: "Test Product",
        description: "Test",
        price: 1,
        image: "test.jpg",
        category: "default",
        stock: 5
      }
    });
    console.log("Success:", product);
  } catch (e) {
    console.error("Error:", e);
  }
}

main(); 