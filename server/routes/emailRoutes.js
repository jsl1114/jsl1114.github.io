import express from "express";
import {
  sendEmail,
  getMessages,
  deleteMessage,
  createMessage,
} from "../controllers/emailController.js";
import { config } from "../config/config.js";

const router = express.Router();

const authenticate = (req, res, next) => {
  const password = req.headers["x-admin-password"];
  if (password === config.adminPassword) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

router.get("/", (req, res) => {
  res.status(200).json({ title: "jsl email server" });
});

router.post("/send-email", sendEmail);
router.post("/messages", createMessage);
router.get("/messages", authenticate, getMessages);
router.delete("/messages/:id", authenticate, deleteMessage);

export default router;
