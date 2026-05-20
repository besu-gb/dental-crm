import { Schema, model, Document, Types } from "mongoose";

// ─── TypeScript Interface ─────────────────────────────────────────────────────
// This gives you full type safety when working with patient documents

export interface IPatient extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  address?: string;
  notes?: string;
  status: "active" | "inactive";
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ──────────────────────────────────────────────────────────

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    address: { type: String, trim: true },
    notes: { type: String, trim: true }, // Medical notes — visible to staff only
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastVisit: { type: Date },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  },
);

export const Patient = model<IPatient>("Patient", patientSchema);
