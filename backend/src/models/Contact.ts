// src/models/Contact.ts
// Messages sent through the clinic website's contact form

import { Schema, model, Document, Types } from "mongoose";

export interface IContact extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  repliedAt?: Date;
  replyMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },

    // Staff marks this true after reading the message
    isRead: { type: Boolean, default: false },

    // Optional — track if/when a reply was sent
    repliedAt: { type: Date },
    replyMessage: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", contactSchema);
