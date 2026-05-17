// src/app/dashboard/checkouts/[userid]/page.tsx
// Patient-specific checkout dashboard: list checkouts, services, payment status,
// totals, and add next checkout.

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getCheckouts,
  createCheckout,
  updateCheckout,
  deleteCheckout,
  getPatient,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, CheckCircle, Send } from "lucide-react";
import { sendCheckoutEmail } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Checkout = {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  serviceProvided?: string;
  invoiceAmount: number;
  invoicePaid: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  emailSubject?: string;
  emailBody?: string;
  nextAppointmentDate?: string;
  followUpNotes?: string;
};

type Patient = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
};

// Form state matches the existing /checkouts page dialog contract
type FormState = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  serviceProvided: string;
  invoiceAmount: string;
  invoicePaid: string; // "false" | "true"
  emailSubject: string;
  emailBody: string;
  nextAppointmentDate: string;
  followUpNotes: string;
};

const emptyForm: FormState = {
  patientId: "",
  patientName: "",
  patientEmail: "",
  appointmentDate: "",
  serviceProvided: "",
  invoiceAmount: "0",
  invoicePaid: "false",
  emailSubject: "Thank you for your visit — Checkout Summary",
  emailBody: "",
  nextAppointmentDate: "",
  followUpNotes: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDateKey(input: string | Date | undefined) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function PatientCheckoutsPage() {
  // app router param name from folder: [userid]
  const params = useParams<{ userid: string }>();
  const patientId = params?.userid;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [nextCheckoutDate, setNextCheckoutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateKey(d);
  });

  useEffect(() => {
    if (!patientId) return;

    async function load() {
      setLoading(true);
      try {
        const [patientsRes, checkoutsRes] = await Promise.all([
          getPatient(patientId),
          getCheckouts(),
        ]);

        setPatient(patientsRes.data ?? patientsRes);

        const all = (checkoutsRes.data ?? []) as Checkout[];
        const filtered = all.filter((c) => c.patientId === patientId);

        // newest first for list
        filtered.sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );

        setCheckouts(filtered);
      } catch (err) {
        console.error(err);
        alert("Failed to load patient checkouts.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientId]);

  const totals = useMemo(() => {
    const totalAmount = checkouts.reduce((sum, c) => sum + c.invoiceAmount, 0);
    const paidAmount = checkouts
      .filter((c) => c.invoicePaid)
      .reduce((sum, c) => sum + c.invoiceAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;

    return { totalAmount, paidAmount, unpaidAmount };
  }, [checkouts]);

  const servicesGrouped = useMemo(() => {
    // Group by appointment date for “services they take in the checkout”
    const map = new Map<string, string[]>();
    for (const c of checkouts) {
      const key = toDateKey(c.appointmentDate);
      if (!map.has(key)) map.set(key, []);
      if (c.serviceProvided && c.serviceProvided.trim()) {
        map.get(key)!.push(c.serviceProvided.trim());
      }
    }
    const entries = Array.from(map.entries()).map(([dateKey, services]) => ({
      dateKey,
      services: Array.from(new Set(services)),
    }));
    // newest first
    entries.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
    return entries;
  }, [checkouts]);

  function openNextCheckoutDialog() {
    if (!patient) return;

    const servicesFromLastCheckout =
      checkouts.find((c) => c.serviceProvided && c.serviceProvided.trim())
        ?.serviceProvided?.trim() ?? "";

    const defaultBody = `Dear ${patient.name},\n\nThank you for visiting our clinic today. Please find your visit summary below.\n\nIf you have any questions, don't hesitate to contact us.\n\nWarm regards,\nDental Clinic Team`;

    setForm({
      ...emptyForm,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      appointmentDate: nextCheckoutDate,
      serviceProvided: servicesFromLastCheckout,
      invoiceAmount: String(totals.unpaidAmount || 0),
      invoicePaid: "false",
      emailSubject: emptyForm.emailSubject,
      emailBody: defaultBody,
      nextAppointmentDate: "",
      followUpNotes: "",
    });

    setDialogOpen(true);
  }

  async function handleCreateCheckout() {
    if (!patientId) return;

    setSaving(true);
    try {
      await createCheckout({
        ...form,
        patientId: patientId,
        invoiceAmount: parseFloat(form.invoiceAmount) || 0,
        invoicePaid: form.invoicePaid === "true",
      });
      setDialogOpen(false);
      setForm(emptyForm);

      // reload
      const res = await getCheckouts();
      const all = (res.data ?? []) as Checkout[];
      const filtered = all
        .filter((c) => c.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );
      setCheckouts(filtered);
    } catch (err) {
      console.error(err);
      alert("Failed to create checkout.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePaid(c: Checkout) {
    try {
      await updateCheckout(c._id, { invoicePaid: !c.invoicePaid });
      setCheckouts((prev) =>
        prev.map((x) =>
          x._id === c._id ? { ...x, invoicePaid: !x.invoicePaid } : x
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update payment status.");
    }
  }

  async function handleDeleteCheckout(id: string) {
    if (!confirm("Delete this checkout record?")) return;

    try {
      await deleteCheckout(id);
      setCheckouts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete checkout.");
    }
  }

  async function handleSendEmail(checkout: Checkout) {
    setSendingId(checkout._id);
    try {
      await sendCheckoutEmail(checkout._id);
      alert(`Email sent to ${checkout.patientEmail}!`);
      setCheckouts((prev) =>
        prev.map((x) =>
          x._id === checkout._id ? { ...x, emailSent: true } : x
        )
      );
    } catch (err: any) {
      console.error(err);
      alert(`Failed to send email: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Patient not found
        </h1>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/checkouts">Back to checkouts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {patient.email}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Patient checkout payment totals
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Total: {formatCurrency(totals.totalAmount)}
            </Badge>
            <Badge variant="success" className="rounded-full">
              Paid: {formatCurrency(totals.paidAmount)}
            </Badge>
            <Badge variant="warning" className="rounded-full">
              Remaining: {formatCurrency(totals.unpaidAmount)}
            </Badge>
          </div>

          <Button onClick={openNextCheckoutDialog} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Next Checkout
          </Button>
        </div>
      </div>

      {/* Next checkout date */}
      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1.5">
              <Label>Next Checkout Date</Label>
              <Input
                type="date"
                value={nextCheckoutDate}
                onChange={(e) => setNextCheckoutDate(e.target.value)}
              />
            </div>

            <div className="text-sm text-gray-600">
              You’ll add a new checkout for this patient on the selected date.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card className="rounded-3xl">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Services taken (by checkout date)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Derived from <span className="font-semibold">serviceProvided</span>.
            </p>
          </div>

          {servicesGrouped.length === 0 ? (
            <div className="p-6 text-muted-foreground">No services yet.</div>
          ) : (
            <div className="p-6 space-y-4">
              {servicesGrouped.map((g) => (
                <div
                  key={g.dateKey}
                  className="border border-gray-200 rounded-2xl p-4"
                >
                  <div className="font-semibold text-gray-900">
                    {formatDate(g.dateKey)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.services.length ? (
                      g.services.map((svc) => (
                        <span
                          key={svc}
                          className="inline-flex items-center px-2 py-1 border border-gray-200 rounded-full bg-white text-sm"
                        >
                          {svc}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checkout List + Payment status */}
      <Card className="rounded-3xl">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Checkout list & payment status
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Toggle paid/unpaid, send email, and add new checkouts.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/checkouts">Back</Link>
            </Button>
          </div>

          {checkouts.length === 0 ? (
            <div className="p-6 text-muted-foreground">No checkouts for this patient.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b-2 border-emerald-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Invoice
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {checkouts.map((c) => {
                    const remainingAfterThis =
                      totals.unpaidAmount; // overall remaining; per-checkout remaining is just invoice if unpaid

                    const paymentVariant = c.invoicePaid ? "success" : "warning";
                    const paymentText = c.invoicePaid ? "Paid" : "Unpaid";
                    return (
                      <tr
                        key={c._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(c.appointmentDate)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {c.serviceProvided || "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(c.invoiceAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => togglePaid(c)}>
                            <Badge
                              variant={paymentVariant}
                              className="rounded-full"
                            >
                              {paymentText}
                            </Badge>
                          </button>
                          {!c.invoicePaid ? (
                            <div className="text-xs text-gray-500 mt-1">
                              Remaining for this invoice: {formatCurrency(c.invoiceAmount)}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1">
                              Overall remaining: {formatCurrency(remainingAfterThis)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.emailSent ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs">Sent</span>
                            </div>
                          ) : (
                            <Badge variant="secondary">Not sent</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(c)}
                              disabled={sendingId === c._id}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {sendingId === c._id ? "Sending..." : "Send Email"}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCheckout(c._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Checkout Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Checkout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Appointment Date *</Label>
              <Input
                type="date"
                value={form.appointmentDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    appointmentDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Service Provided</Label>
              <Input
                value={form.serviceProvided}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceProvided: e.target.value,
                  }))
                }
                placeholder="e.g. Cleaning, Root Canal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Invoice Amount</Label>
                <Input
                  type="number"
                  value={form.invoiceAmount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      invoiceAmount: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Payment Status</Label>
                <Select
                  value={form.invoicePaid}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      invoicePaid: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Unpaid</SelectItem>
                    <SelectItem value="true">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Next Appointment Date</Label>
              <Input
                type="date"
                value={form.nextAppointmentDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nextAppointmentDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email Subject</Label>
              <Input
                value={form.emailSubject}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    emailSubject: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email Body (sent to patient)</Label>
              <Textarea
                value={form.emailBody}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    emailBody: e.target.value,
                  }))
                }
                rows={6}
                placeholder="Write the email message..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateCheckout}
                disabled={
                  saving ||
                  !form.patientId ||
                  !form.appointmentDate ||
                  !form.invoiceAmount
                }
              >
                {saving ? "Saving..." : "Create Checkout"}
              </Button>
            </div>

            {/* keep hidden fields alignment with the dialog concept */}
            <input type="hidden" value={form.patientId} readOnly />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
