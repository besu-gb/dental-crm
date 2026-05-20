import { Request, Response } from "express";
import { Patient } from "../models/Patient.js";
import { Booking } from "../models/Booking.js";
import { Post } from "../models/Post.js";
import { Checkout } from "../models/Checkout.js";
import { Contact } from "../models/Contact.js";

function toTotalAmount(result: { total?: number } | undefined) {
  return result?.total ?? 0;
}

export async function getDashboardStats(req: Request, res: Response) {
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
      unpaidCheckouts,
      partialCheckouts,
      paidCheckouts,
      invoiceTotals,
      paymentTotals,
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
      Checkout.countDocuments({ paymentStatus: "unpaid" }),
      Checkout.countDocuments({ paymentStatus: "partial" }),
      Checkout.countDocuments({ paymentStatus: "paid" }),
      Checkout.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$invoiceAmount" },
          },
        },
      ]),
      Checkout.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        patients: { total: totalPatients, active: activePatients },
        bookings: { total: totalBookings, pending: pendingBookings },
        posts: { published: publishedPosts, draft: draftPosts },
        contacts: { unread: unreadContacts },
        checkouts: {
          recentCheckouts,
          unpaidCheckouts,
          partialCheckouts,
          paidCheckouts,
          totalInvoiceAmount: toTotalAmount(invoiceTotals[0]),
          totalPaidAmount: toTotalAmount(paymentTotals[0]),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ 
        success: false, 
        message: (error as Error).message 
    });
  }
}