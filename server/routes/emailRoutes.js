import express from "express";
import {
  sendEmail,
  getMessages,
  deleteMessage,
  createMessage,
} from "../controllers/emailController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ title: "jsl email server" });
});

router.post("/send-email", sendEmail);
router.post("/messages", createMessage);
router.get("/messages", getMessages);
router.delete("/messages/:id", deleteMessage);

export default router;
