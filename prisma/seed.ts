import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gearup.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "GearUp Admin";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Admin ready: ${admin.email}`);

  const categories = [
    { name: "Cycling", description: "Bikes, helmets, and cycling accessories" },
    { name: "Camping", description: "Tents, sleeping bags, and camp gear" },
    { name: "Fitness", description: "Gym and fitness equipment" },
    { name: "Water Sports", description: "Kayaks, paddleboards, and diving gear" },
    { name: "Hiking", description: "Backpacks, boots, and trekking gear" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories ready`);

  // Sample provider + gear so the API has data to demo immediately
  const providerPassword = await bcrypt.hash("Provider@123", 10);
  const provider = await prisma.user.upsert({
    where: { email: "provider@gearup.com" },
    update: {},
    create: {
      name: "Trailhead Rentals",
      email: "provider@gearup.com",
      password: providerPassword,
      role: "PROVIDER",
      status: "ACTIVE",
    },
  });

  const cyclingCategory = await prisma.category.findUnique({ where: { name: "Cycling" } });
  const campingCategory = await prisma.category.findUnique({ where: { name: "Camping" } });

  if (cyclingCategory) {
    await prisma.gearItem.upsert({
      where: { id: "seed-gear-mountain-bike" },
      update: {},
      create: {
        id: "seed-gear-mountain-bike",
        name: "Trek Mountain Bike",
        description: "Full-suspension mountain bike, great for rough trails and all-day rides.",
        brand: "Trek",
        pricePerDay: 25,
        images: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91"],
        stock: 5,
        availableStock: 5,
        categoryId: cyclingCategory.id,
        providerId: provider.id,
      },
    });
  }

  if (campingCategory) {
    await prisma.gearItem.upsert({
      where: { id: "seed-gear-tent" },
      update: {},
      create: {
        id: "seed-gear-tent",
        name: "4-Person Camping Tent",
        description: "Waterproof, easy-setup tent, perfect for weekend camping trips.",
        brand: "Coleman",
        pricePerDay: 15,
        images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"],
        stock: 8,
        availableStock: 8,
        categoryId: campingCategory.id,
        providerId: provider.id,
      },
    });
  }

  console.log("✅ Sample provider & gear ready");
  console.log("\n--- Seed complete ---");
  console.log(`Admin login:    ${adminEmail} / ${adminPassword}`);
  console.log(`Provider login: provider@gearup.com / Provider@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
