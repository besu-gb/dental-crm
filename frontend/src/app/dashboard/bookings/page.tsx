// src/app/dashboard/bookings/page.tsx
// View and manage booking requests from the website

"use client";

import { useEffect, useState } from "react";
import { getBookings, updateBooking, deleteBooking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Eye, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Booking {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  serviceType?: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  staffNotes?: string;
  createdAt: string;
}

// Badge color per booking status
const statusVariant: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  completed: "secondary",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await getBookings(
        statusFilter === "all" ? undefined : statusFilter,
      );
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openDetail(booking: Booking) {
    setSelected(booking);
    setStaffNotes(booking.staffNotes || "");
    setNewStatus(booking.status);
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateBooking(selected._id, { status: newStatus, staffNotes });
      setSelected(null);
      loadBookings();
    } catch (err) {
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    try {
      await deleteBooking(id);
      loadBookings();
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track booking requests
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg border border-blue-100">
        {["all", "pending", "confirmed", "cancelled", "completed"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize rounded-lg"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-muted-foreground">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500/10 to-transparent border-b-2 border-blue-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Preferred Date
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Received
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {b.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{b.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {b.serviceType || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {b.preferredDate
                          ? `${formatDate(b.preferredDate)}${b.preferredTime ? ` at ${b.preferredTime}` : ""}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={statusVariant[b.status]}
                          className="rounded-full"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(b)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(b._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Booking from {selected.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-muted/30 rounded-lg p-3">
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {selected.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {selected.phone || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Service:</span>{" "}
                  {selected.serviceType || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Preferred:</span>{" "}
                  {selected.preferredDate
                    ? formatDate(selected.preferredDate)
                    : "—"}
                  {selected.preferredTime
                    ? ` at ${selected.preferredTime}`
                    : ""}
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">
                    Patient Message:
                  </p>
                  <p className="bg-muted/30 rounded p-3">{selected.message}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Staff Notes</Label>
                <Textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
