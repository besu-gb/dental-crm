import { Request, Response } from "express";
import { Checkout } from "../models/Checkout.js";
import { Patient } from "../models/Patient.js";
import { transporter } from "../lib/mailer.js";

function toNumber(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

function resolvePaymentStatus(
  invoiceAmount: number,
  amountPaid: number,
): "unpaid" | "partial" | "paid" {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid >= invoiceAmount) return "paid";
  return "partial";
}

function normalizeCheckoutBody(body: Record<string, unknown>) {
  const invoiceAmount = toNumber(body.invoiceAmount);
  const amountPaid =
    body.amountPaid === undefined ? 0 : toNumber(body.amountPaid);
  const paymentStatus = resolvePaymentStatus(invoiceAmount, amountPaid);

  return {
    ...body,
    invoiceAmount,
    amountPaid,
    paymentStatus,
  };
}

export async function getAllCheckouts(req: Request, res: Response) {
  try {
    const { patientId } = req.query;

    const filter =
      typeof patientId === "string" && patientId.trim() ? { patientId } : {};

    const checkouts = await Checkout.find(filter)
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: checkouts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getCheckoutById(req: Request, res: Response) {
  try {
    const checkout = await Checkout.findById(req.params.id).populate(
      "patientId",
    );
    if (!checkout) {
      res.status(404).json({ success: false, message: "Checkout not found" });
      return;
    }
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function addCheckout(req: Request, res: Response) {
  try {
    const payload = normalizeCheckoutBody(req.body as Record<string, unknown>);
    const checkout = new Checkout(payload);
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
}

export async function editCheckout(req: Request, res: Response) {
  try {
    const payload = normalizeCheckoutBody(req.body as Record<string, unknown>);
    const checkout = await Checkout.findByIdAndUpdate(req.params.id, payload, {
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
}

export async function deleteCheckout(req: Request, res: Response) {
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
}

export async function sendCheckoutEmail(req: Request, res: Response) {
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
      html:
        checkout.emailBody ??
        `<p>Thank you for visiting us, ${checkout.patientName}!</p>`,
    });

    // Mark as sent so we can show this in the dashboard
    checkout.emailSent = true;
    checkout.emailSentAt = new Date();
    await checkout.save();

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
