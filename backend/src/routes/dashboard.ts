// src/routes/dashboard.ts
// Overview stats for the dashboard home page
// Base URL: /api/dashboard

import { Router, Request, Response } from "express";
import { Patient } from "../models/Patient.js";
import { Booking } from "../models/Booking.js";
import { Post } from "../models/Post.js";
import { Checkout } from "../models/Checkout.js";
import { Contact } from "../models/Contact.js";

const router = Router();

// ─── GET /api/dashboard/stats ──────────────────────────────────────────────
// All queries run in parallel with Promise.all for speed
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [
      totalPatients,
      activePatients,
      pendingBookings,
      totalBookings,
      publishedPosts,
      draftPosts,
      unreadContacts,
      recentCheckouts,
      pendingInvoices,
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: "active" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Contact.countDocuments({ isRead: false }),
      Checkout.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("patientId", "name"),
      Checkout.countDocuments({ invoicePaid: false }),
    ]);

    res.json({
      success: true,
      data: {
        patients: { total: totalPatients, active: activePatients },
        bookings: { total: totalBookings, pending: pendingBookings },
        posts: { published: publishedPosts, draft: draftPosts },
        contacts: { unread: unreadContacts },
        checkouts: { recentCheckouts, pendingInvoices },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
