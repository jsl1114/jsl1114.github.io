import { sendContactEmails } from "../services/emailService.jsx";

export const sendEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendContactEmails({ name, email, message });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
