import { Router } from "express";
import { getAllBooking, getBookingById, deleteBookingById } from "../controller/booking.controller.js";

const router = Router();

// ─── GET /api/bookings ─────────────────────────────────────────────────────
router.get("/", getAllBooking);

// ─── GET /api/bookings/:id ─────────────────────────────────────────────────
router.get("/:id", getBookingById);

// ─── DELETE /api/bookings/:id ──────────────────────────────────────────────
router.delete("/:id", deleteBookingById);

export default router;
