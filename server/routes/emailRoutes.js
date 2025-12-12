import express from "express";
import { sendEmail } from "../controllers/emailController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ title: "jsl email server" });
});

router.post("/send-email", sendEmail);

export default router;
