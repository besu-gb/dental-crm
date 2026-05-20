import { Router } from "express";
import {
  getAllPosts,
  getPostsById,
  addPosts,
  editPosts,
  deletePosts,
} from "../controller/posts.controller";

const router = Router();

// ─── GET /api/posts ────────────────────────────────────────────────────────
router.get("/", getAllPosts);

// ─── GET /api/posts/:id ────────────────────────────────────────────────────
router.get("/:id", getPostsById);

// ─── POST /api/posts ───────────────────────────────────────────────────────
router.post("/", addPosts);

// ─── PUT /api/posts/:id ────────────────────────────────────────────────────
router.put("/:id", editPosts);

// ─── DELETE /api/posts/:id ─────────────────────────────────────────────────
router.delete("/:id", deletePosts);

export default router;
