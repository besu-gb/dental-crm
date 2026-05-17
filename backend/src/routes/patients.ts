// src/routes/patients.ts
// CRUD endpoints for patient records
// Base URL: /api/patients

import { Router, Request, Response } from "express";
import { Patient } from "../models/Patient.js";

const router = Router();

// ─── GET /api/patients ─────────────────────────────────────────────────────
// Returns all patients, newest first. Supports ?search= query param.
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const filter =
      typeof search === "string" && search.trim()
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/patients/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/patients ────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── PUT /api/patients/:id ─────────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/patients/:id ──────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }
    res.json({ success: true, message: "Patient deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
