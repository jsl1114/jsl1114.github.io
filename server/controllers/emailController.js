import prisma from "../lib/prisma.js";
import { sendContactEmails } from "../services/emailService.jsx";

export const createMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save to MySQL via Prisma
    await prisma.message.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Send emails
    await sendContactEmails({ name, email, message });

    res
      .status(200)
      .json({ message: "Message saved and email sent successfully" });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};

export const sendEmail = createMessage;

export const getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.message.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
