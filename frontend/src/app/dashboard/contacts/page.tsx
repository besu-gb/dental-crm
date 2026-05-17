// src/app/dashboard/contacts/page.tsx
// View and manage contact messages from the clinic website

"use client";

import { useEffect, useState } from "react";
import { getContacts, updateContact, deleteContact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Eye, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    try {
      const res = await getContacts();
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(contact: Contact) {
    setSelected(contact);
    // Mark as read if it wasn't already
    if (!contact.isRead) {
      try {
        await updateContact(contact._id, { isRead: true });
        // Update local state immediately (no need to reload all)
        setContacts((prev) =>
          prev.map((c) => (c._id === contact._id ? { ...c, isRead: true } : c)),
        );
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteContact(id);
      if (selected?._id === id) setSelected(null);
      loadContacts();
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contacts.length} total messages
            {unreadCount > 0 && (
              <span className="ml-3 inline-block">
                <Badge variant="default" className="rounded-full">
                  {unreadCount} unread
                </Badge>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages List */}
      <Card className="border-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="p-6 text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={cn(
                    "flex items-start justify-between gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-violet-50 hover:to-transparent cursor-pointer transition-colors",
                    !contact.isRead && "bg-violet-50/30",
                  )}
                  onClick={() => openMessage(contact)}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        !contact.isRead ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            !contact.isRead && "font-bold",
                          )}
                        >
                          {contact.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {contact.email}
                        </span>
                      </div>
                      {contact.subject && (
                        <p className="text-sm font-medium mt-0.5">
                          {contact.subject}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {contact.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(contact.createdAt)}
                        {contact.phone && ` · ${contact.phone}`}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openMessage(contact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(contact._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Message from {selected.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded-lg p-3">
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-primary hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    {selected.phone}
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Received: </span>
                  {formatDate(selected.createdAt)}
                </div>
              </div>

              {/* Subject */}
              {selected.subject && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">
                    Subject:
                  </p>
                  <p className="font-medium">{selected.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-muted-foreground font-medium mb-1">
                  Message:
                </p>
                <div className="bg-muted/30 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>
              </div>

              {/* Quick Reply Link */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                <Button asChild>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
