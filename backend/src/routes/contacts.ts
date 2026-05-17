// src/routes/contacts.ts
// Messages submitted via the clinic website's contact form
// Base URL: /api/contacts

import { Router, Request, Response } from "express";
import { Contact } from "../models/Contact.js";

const router = Router();

// ─── GET /api/contacts ─────────────────────────────────────────────────────
// Returns all messages — unread ones appear first
router.get("/", async (req: Request, res: Response) => {
  try {
    const { isRead } = req.query;

    const filter =
      typeof isRead === "string"
        ? { isRead: isRead === "true" }
        : {};

    const contacts = await Contact.find(filter).sort({ isRead: 1, createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/contacts/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/contacts ────────────────────────────────────────────────────
// Used by the clinic website's contact form
router.post("/", async (req: Request, res: Response) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── PUT /api/contacts/:id ─────────────────────────────────────────────────
// Mark as read, or save a reply note
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!contact) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/contacts/:id ──────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
