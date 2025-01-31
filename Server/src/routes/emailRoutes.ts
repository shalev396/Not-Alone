import express from "express";
import { sendEmail } from "../../apis/email/emailHelper";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const testEmail = {
      to: "shalev396@gmail.com",
      subject: "Test Email",
      // text: "This is a test email from the Not-Alone server.",
      html: "<h1>Hello</h1>",
    };

    await sendEmail(testEmail.to, testEmail.subject, "", testEmail.html);
    res.status(200).json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: "Failed to send test email" });
  }
});

export default router;
