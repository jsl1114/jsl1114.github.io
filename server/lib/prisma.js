import { PrismaClient } from "@prisma/client";
import { config } from "../config/config.js";

// Construct database URL from individual env vars if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

export default prisma;
