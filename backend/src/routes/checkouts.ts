import { Router } from "express"
import {
  getAllCheckouts,
  getCheckoutById,
  addCheckout,
  editCheckout,
  deleteCheckout,
  sendCheckoutEmail,
} from "../controller/checkouts.controller.js";

const router = Router();

// ─── GET /api/checkouts ────────────────────────────────────────────────────
router.get("/", getAllCheckouts);

// ─── GET /api/checkouts/:id ────────────────────────────────────────────────
router.get("/:id", getCheckoutById);

// ─── POST /api/checkouts ───────────────────────────────────────────────────
router.post("/", addCheckout);

// ─── PUT /api/checkouts/:id ────────────────────────────────────────────────
router.put("/:id", editCheckout);

// ─── DELETE /api/checkouts/:id ─────────────────────────────────────────────
router.delete("/:id", deleteCheckout);

// ─── POST /api/checkouts/:id/send-email ───────────────────────────────────
router.post("/:id/send-email", sendCheckoutEmail);

export default router;
