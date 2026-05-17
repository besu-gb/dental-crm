// src/models/Checkout.ts
// Checkout records — created when a patient's appointment is complete.
// Staff then sends the patient a summary email from this record.

import { Schema, model, Document, Types } from "mongoose";

export interface ICheckout extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  patientName: string;
  patientEmail: string;
  appointmentDate: Date;
  serviceProvided?: string;
  invoiceAmount: number;
  invoicePaid: boolean;
  emailSubject?: string;
  emailBody?: string;
  emailSent: boolean;
  emailSentAt?: Date;
  nextAppointmentDate?: Date;
  followUpNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutSchema = new Schema<ICheckout>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },

    appointmentDate: { type: Date, required: true },
    serviceProvided: { type: String, trim: true }, // e.g. "Root Canal", "Cleaning"

    // Invoice
    invoiceAmount: { type: Number, default: 0 }, // in your local currency
    invoicePaid: { type: Boolean, default: false },

    // Email content composed by staff before sending
    emailSubject: { type: String, trim: true },
    emailBody: { type: String, trim: true },

    // Tracks whether the email was sent
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },

    // Follow-up
    nextAppointmentDate: { type: Date },
    followUpNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Checkout = model<ICheckout>("Checkout", checkoutSchema);
