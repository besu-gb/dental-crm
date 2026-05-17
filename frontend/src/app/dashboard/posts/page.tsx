// src/app/dashboard/posts/page.tsx
// Create and manage blog posts for the clinic website

"use client";

import { useEffect, useState } from "react";
import { getPosts, createPost, updatePost, deletePost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: "draft" | "published";
  tags: string[];
  authorName?: string;
  createdAt: string;
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  tags: "",
  coverImage: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PostsPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(post: Post) {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      status: post.status,
      tags: post.tags.join(", "),
      coverImage: "",
    });
    setDialogOpen(true);
  }

  // Auto-generate slug from title
  function handleTitleChange(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setForm({ ...form, title, slug });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorId: user?.id,
        authorName: user?.fullName || "Admin",
      };

      if (editingPost) {
        await updatePost(editingPost._id, payload);
      } else {
        await createPost(payload);
      }
      setDialogOpen(false);
      loadPosts();
    } catch (err) {
      alert("Failed to save post.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(id);
      loadPosts();
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  async function togglePublish(post: Post) {
    try {
      await updatePost(post._id, {
        status: post.status === "published" ? "draft" : "published",
      });
      loadPosts();
    } catch (err) {
      alert("Failed to update status.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage blog content
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Button
          onClick={openAddDialog}
          className="rounded-lg hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Post Cards */}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">
          No posts yet. Create your first blog post!
        </p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="border-0 rounded-lg hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-100 to-gray-100"
            >
              <CardContent className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      variant={
                        post.status === "published" ? "success" : "secondary"
                      }
                      className="rounded-lg"
                    >
                      {post.status}
                    </Badge>
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs rounded-full"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    By {post.authorName || "Admin"} ·{" "}
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={
                      post.status === "published" ? "destructive" : "default"
                    }
                    onClick={() => togglePublish(post)}
                    className="rounded-lg"
                  >
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(post)}
                    className="rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive rounded-lg"
                    onClick={() => handleDelete(post._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "New Blog Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Slug (URL-friendly name)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Excerpt (short summary)</Label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder="Write your post content here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="dental, hygiene, tips"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
              >
                {saving ? "Saving..." : "Save Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
