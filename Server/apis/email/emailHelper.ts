import "dotenv";
import express from "express";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 1 second

//Configure the Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "SMTP",
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: false, // use TLS (true) if port is 465, otherwise false
});

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  retryCount = 0
): Promise<any> => {
  try {
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      throw new Error(
        "Missing required fields: 'to', 'subject', and either 'text' or 'html'."
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email format");
    }

    // 3) Send the email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error: any) {
      // Check if we should retry
      if (retryCount < MAX_RETRIES) {
        console.log(`Email send attempt ${retryCount + 1} failed. Retrying...`);
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return sendEmail(to, subject, text, html, retryCount + 1);
      }

      // If we've exhausted retries, throw a detailed error
      throw new Error(
        `Failed to send email after ${MAX_RETRIES} attempts: ${error.message}`
      );
    }
  } catch (error: any) {
    // Log the error with additional context
    console.error("Email Error:", {
      error: error.message,
      recipient: to,
      subject: subject,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
};

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take messages");
  }
});
