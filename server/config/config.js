import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the root of the project
dotenv.config({ path: join(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT || 3000,
  email: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
  adminPassword: process.env.VITE_ADMIN_PASSWORD,
};
