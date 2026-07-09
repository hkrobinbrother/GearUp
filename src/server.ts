import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const PORT = parseInt(env.PORT);

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 GearUp API running on port ${PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

main();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
