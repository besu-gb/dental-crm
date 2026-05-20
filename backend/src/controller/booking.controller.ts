import { Request, Response } from "express";
import { Booking, type IBooking } from "../models/Booking";

export async function getAllBooking(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const normalizedStatus =
      status === "pending" ||
      status === "confirmed" ||
      status === "cancelled" ||
      status === "completed"
        ? (status as IBooking["status"])
        : undefined;

    const booking = Booking.find(
      normalizedStatus ? { status: normalizedStatus } : {},
    )
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getBookingById(req: Request, res: Response) {
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
}

export async function deleteBookingById(req: Request, res: Response) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
        res.status(404).json({
            success: false,
            message: "Booking not found"
        })

        return;
    }
    return res.json({
        success: true,
        message: "Booking deleted successfully."
    })
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
