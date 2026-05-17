// src/routes/bookings.ts
// CRUD endpoints for booking requests from the website
// Base URL: /api/bookings

import { Router, Request, Response } from "express";
import { Booking } from "../models/Booking.js";

const router = Router();

// ─── GET /api/bookings ─────────────────────────────────────────────────────
// Supports ?status=pending to filter by status
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter = typeof status === "string" && status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate("patientId", "name email") // attach patient name/email if linked
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/bookings/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("patientId");
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/bookings ────────────────────────────────────────────────────
// Called by the clinic website's booking form
router.post("/", async (req: Request, res: Response) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── PUT /api/bookings/:id ─────────────────────────────────────────────────
// Staff confirms, cancels, or updates notes
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/bookings/:id ──────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
