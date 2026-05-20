import { Router } from "express";
import {
  getAllPatients,
  getPatientsById,
  addPatients,
  editPatients,
  deletePatients,
} from "../controller/patients.controller";

const router = Router();

// ─── GET /api/patients ─────────────────────────────────────────────────────
router.get("/", getAllPatients);

// ─── GET /api/patients/:id ─────────────────────────────────────────────────
router.get("/:id", getPatientsById);

// ─── POST /api/patients ────────────────────────────────────────────────────
router.post("/", addPatients);

// ─── PUT /api/patients/:id ─────────────────────────────────────────────────
router.put("/:id", editPatients);

// ─── DELETE /api/patients/:id ──────────────────────────────────────────────
router.delete("/:id", deletePatients);

export default router;
