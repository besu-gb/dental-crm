// src/lib/mailer.ts
// Shared Nodemailer transporter — import this wherever you need to send email

import nodemailer from "nodemailer";

// Created once and reused across the app
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT ?? "587"),
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
