import { Router } from "express";
import { getAllContacts, getContactById, deleteContactById } from "../controller/contacts.controller";

const router = Router();

// ─── GET /api/contacts ─────────────────────────────────────────────────────
router.get("/", getAllContacts);

// ─── GET /api/contacts/:id ─────────────────────────────────────────────────
router.get("/:id", getContactById);

// ─── DELETE /api/contacts/:id ──────────────────────────────────────────────
router.delete("/:id", deleteContactById);

export default router;
