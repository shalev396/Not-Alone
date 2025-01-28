import "dotenv";
import express from "express";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

//Configure the Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: false, // use TLS (true) if port is 465, otherwise false
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      throw new Error(
        "Missing required fields: 'to', 'subject', and either 'text' or 'html'."
      );
    }

    // 3) Send the email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html, // HTML body (optional)
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    throw error;
  }
};
