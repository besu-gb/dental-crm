// src/app/dashboard/patients/page.tsx
// Manage clinic patients — view, add, edit, delete

"use client";

import { useEffect, useState } from "react";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/lib/api";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  notes?: string;
  status: "active" | "inactive";
  lastVisit?: string;
  createdAt: string;
}

// Empty form state — used when creating a new patient
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  notes: "",
  status: "active",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients(searchTerm?: string) {
    setLoading(true);
    try {
      const res = await getPatients(searchTerm);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Search with a small delay so we don't fire on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => loadPatients(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  function openAddDialog() {
    setEditingPatient(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(patient: Patient) {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
      gender: patient.gender || "",
      address: patient.address || "",
      notes: patient.notes || "",
      status: patient.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient._id, form);
      } else {
        await createPatient(form);
      }
      setDialogOpen(false);
      loadPatients(search);
    } catch (err) {
      alert("Failed to save patient. Check console.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this patient? This cannot be undone.")) return;
    try {
      await deletePatient(id);
      loadPatients(search);
    } catch (err) {
      alert("Failed to delete.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage patient records and information
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-lg border border-cyan-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg border-gray-300"
          />
        </div>
        <Button
          onClick={openAddDialog}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Patient
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-100">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Loading...</p>
          ) : patients.length === 0 ? (
            <p className="p-6 text-muted-foreground">No patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500/10 to-transparent border-b-2 border-cyan-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Last Visit
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
                  {patients.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(p.lastVisit)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.status === "active" ? "success" : "secondary"
                          }
                          className="rounded-full"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(p._id)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Medical Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Allergies, conditions, medications..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email}
              >
                {saving ? "Saving..." : "Save Patient"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
