import { PrismaClient } from "@prisma/client";
import { config } from "../config/config.js";

// Construct database URL from individual env vars if DATABASE_URL is not set
const connectionString =
  process.env.DATABASE_URL ||
  `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || "db.jasonl.us"}/${process.env.DB_NAME}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
});

export default prisma;
