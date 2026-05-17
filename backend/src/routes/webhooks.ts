// src/routes/webhooks.ts
// Handles incoming webhook events from Clerk (user sign up, deletion, etc.)
// Base URL: /api/webhooks
//
// HOW TO SET UP:
// 1. Go to your Clerk dashboard → Webhooks
// 2. Add endpoint: https://your-backend-url/api/webhooks/clerk
// 3. Copy the signing secret into CLERK_WEBHOOK_SECRET in .env

import { Router, Request, Response } from "express";
import { Webhook } from "svix";

const router = Router();

// NOTE: This route needs the raw request body for signature verification.
// We use express.raw() only here — the rest of the app uses express.json().
router.post(
  "/clerk",
  express_raw(), // see server.ts — we pass raw middleware inline
  async (req: Request, res: Response) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("CLERK_WEBHOOK_SECRET not set — skipping webhook verification");
      res.status(200).json({ message: "No secret configured" });
      return;
    }

    const wh = new Webhook(secret);
    let event: ReturnType<typeof wh.verify>;

    try {
      event = wh.verify(req.body as Buffer, {
        "svix-id": req.headers["svix-id"] as string,
        "svix-timestamp": req.headers["svix-timestamp"] as string,
        "svix-signature": req.headers["svix-signature"] as string,
      }) as { type: string; data: Record<string, unknown> };
    } catch {
      res.status(400).json({ message: "Invalid webhook signature" });
      return;
    }

    const { type, data } = event as { type: string; data: Record<string, unknown> };

    switch (type) {
      case "user.created": {
        const emails = data.email_addresses as Array<{ email_address: string }>;
        console.log("New Clerk user:", emails?.[0]?.email_address);
        // You could create a staff record here, send a welcome email, etc.
        break;
      }

      case "user.deleted":
        console.log("Clerk user deleted:", data.id);
        break;

      default:
        console.log("Unhandled Clerk event:", type);
    }

    res.status(200).json({ message: "Webhook received" });
  }
);

// Small helper so we don't import express twice — imported in server.ts
import express from "express";
function express_raw() {
  return express.raw({ type: "application/json" });
}

export default router;
