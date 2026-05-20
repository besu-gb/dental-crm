import { Request, Response } from "express";
import { Post } from "../models/Post";

export async function getAllPosts(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const query = Post.find();

    if (status === "draft" || status === "published") {
      query.where("status").equals(status);
    }

    const posts = await query.sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function getPostsById(req: Request, res: Response) {
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
}

export async function addPosts(req: Request, res: Response) {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
}

export async function editPosts(req: Request, res: Response) {
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
}

export async function deletePosts(req: Request, res: Response) {
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
}
