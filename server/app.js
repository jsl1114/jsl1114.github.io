import express from "express";
import cors from "cors";
import morgan from "morgan";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/", emailRoutes);

// Catch invalid paths
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
