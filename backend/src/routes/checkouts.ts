// src/routes/checkouts.ts
// Checkout records + sending summary emails to patients
// Base URL: /api/checkouts

import { Router, Request, Response } from "express";
import { Checkout } from "../models/Checkout.js";
import { Patient } from "../models/Patient.js";
import { transporter } from "../lib/mailer.js";

const router = Router();

// ─── GET /api/checkouts ────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const checkouts = await Checkout.find()
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: checkouts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/checkouts/:id ────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate("patientId");
    if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
    }
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/checkouts ───────────────────────────────────────────────────
// Creates a new checkout and updates the patient's lastVisit date
router.post("/", async (req: Request, res: Response) => {
  try {
    const checkout = new Checkout(req.body);
    await checkout.save();

    // Update the patient's lastVisit field automatically
    if (checkout.patientId) {
      await Patient.findByIdAndUpdate(checkout.patientId, {
        lastVisit: checkout.appointmentDate,
      });
    }

    res.status(201).json({ success: true, data: checkout });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── PUT /api/checkouts/:id ────────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const checkout = await Checkout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
    }
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/checkouts/:id/send-email ───────────────────────────────────
// Sends the checkout summary email to the patient and marks it as sent
router.post("/:id/send-email", async (req: Request, res: Response) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: checkout.patientEmail,
      subject: checkout.emailSubject ?? "Your Visit Summary",
      html: checkout.emailBody ?? `<p>Thank you for visiting us, ${checkout.patientName}!</p>`,
    });

    // Mark as sent so we can show this in the dashboard
    checkout.emailSent = true;
    checkout.emailSentAt = new Date();
    await checkout.save();

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/checkouts/:id ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const checkout = await Checkout.findByIdAndDelete(req.params.id);
    if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
    }
    res.json({ success: true, message: "Checkout deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
