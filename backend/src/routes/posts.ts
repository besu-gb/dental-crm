import { Router, Request, Response } from "express";
import { Post } from "../models/Post.js";

const router = Router();

// ─── GET /api/posts ────────────────────────────────────────────────────────
// Supports ?status=published to only return public posts
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter = typeof status === "string" && status ? { status } : {};

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/posts/:id ────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── POST /api/posts ───────────────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── PUT /api/posts/:id ────────────────────────────────────────────────────
// Edit content or change status to "published"
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/posts/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
