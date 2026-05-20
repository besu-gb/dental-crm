// src/models/Post.ts
// Blog posts published on the clinic website

import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId?: string;
  authorName?: string;
  status: "draft" | "published";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },    // Short summary shown on listing pages
    coverImage: { type: String, trim: true }, // URL to a cover image
    authorId: { type: String, trim: true },   // Clerk user ID
    authorName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Auto-generate slug from title if one isn't provided
postSchema.pre("save", function (this: IPost) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export const Post = model<IPost>("Post", postSchema);
