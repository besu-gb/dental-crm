"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createCheckout, getCheckouts, getPatient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, Plus } from "lucide-react";

type Checkout = {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  serviceProvided?: string;
  invoiceAmount: number;
  amountPaid: number;
  paymentStatus: "unpaid" | "partial" | "paid";
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

type FormState = {
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  serviceProvided: string;
  invoiceAmount: string;
  amountPaid: string;
  paymentStatus: "unpaid" | "partial" | "paid";
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
  amountPaid: "0",
  paymentStatus: "unpaid",
  emailSubject: "Thank you for your visit — Visit Summary",
  emailBody: "",
  nextAppointmentDate: "",
  followUpNotes: "",
};

function toDateKey(input: string | Date | undefined) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function resolvePaymentStatus(invoiceAmount: number, amountPaid: number) {
  if (amountPaid <= 0) return "unpaid";
  if (invoiceAmount <= 0) return "paid";
  if (amountPaid >= invoiceAmount) return "paid";
  return "partial";
}

function formatOptionalDate(input: string | Date | undefined) {
  if (!input) return "—";
  return formatDate(input) || "—";
}

export default function PatientCheckoutsPage() {
  const params = useParams<{ userid: string }>();
  const patientId = params?.userid;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!patientId) return;

    async function load() {
      setLoading(true);
      try {
        const [patientRes, checkoutsRes] = await Promise.all([
          getPatient(patientId),
          getCheckouts(patientId),
        ]);

        setPatient(patientRes.data ?? patientRes);
        const all = (checkoutsRes.data ?? []) as Checkout[];
        const sorted = [...all].sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );
        setCheckouts(sorted);
      } catch (err) {
        console.error(err);
        alert("Failed to load patient visits.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientId]);

  const totals = useMemo(() => {
    const treatmentCheckout = [...checkouts]
      .reverse()
      .find((c) => c.invoiceAmount > 0);
    const treatmentTotal = treatmentCheckout?.invoiceAmount ?? 0;
    const paidAmount = checkouts.reduce((sum, c) => sum + c.amountPaid, 0);
    const remainingAmount = Math.max(treatmentTotal - paidAmount, 0);

    return { treatmentTotal, paidAmount, remainingAmount };
  }, [checkouts]);

  const isFirstVisit = checkouts.length === 0;
  const latestCheckout = checkouts[0] ?? null;
  const latestNextAppointment = latestCheckout?.nextAppointmentDate
    ? toDateKey(latestCheckout.nextAppointmentDate)
    : "";
  const latestService = latestCheckout?.serviceProvided?.trim() ?? "";

  function openVisitDialog() {
    if (!patient) return;

    const defaultVisitDate = latestNextAppointment || toDateKey(new Date());

    const defaultBody = `Dear ${patient.name},

Thank you for visiting our clinic today. Please find your visit summary below.

If you have any questions, don't hesitate to contact us.

Warm regards,
Dental Clinic Team`;

    setForm({
      ...emptyForm,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      appointmentDate: defaultVisitDate,
      serviceProvided: "",
      invoiceAmount: "0",
      amountPaid: "0",
      paymentStatus: "unpaid",
      emailSubject: emptyForm.emailSubject,
      emailBody: defaultBody,
      nextAppointmentDate: "",
      followUpNotes: "",
    });

    setDialogOpen(true);
  }

  async function handleCreateCheckout() {
    if (!patientId) return;

    const invoiceAmount = Number(form.invoiceAmount) || 0;
    const amountPaid = Number(form.amountPaid) || 0;
    const paymentStatus = resolvePaymentStatus(invoiceAmount, amountPaid);

    setSaving(true);
    try {
      await createCheckout({
        ...form,
        patientId,
        invoiceAmount,
        amountPaid,
        paymentStatus,
      });

      setDialogOpen(false);
      setForm(emptyForm);

      const res = await getCheckouts(patientId);
      const all = (res.data ?? []) as Checkout[];
      const sorted = [...all].sort(
        (a, b) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
      );
      setCheckouts(sorted);
    } catch (err) {
      console.error(err);
      alert("Failed to create visit record.");
    } finally {
      setSaving(false);
    }
  }

  const visitCostLabel = "Total treatment cost";
  const visitCostHelp = isFirstVisit
    ? "Enter the full amount for the first treatment plan."
    : "Already stored on the first visit. Leave this as 0 for follow-ups.";
  const paymentLabel = isFirstVisit ? "Paid now" : "Paid today";

  const canSaveVisit =
    !saving &&
    !!form.patientId &&
    !!form.appointmentDate &&
    !!form.serviceProvided.trim() &&
    (isFirstVisit ? Number(form.invoiceAmount) > 0 : true);

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
        <h1 className="text-2xl font-bold text-gray-900">Patient not found</h1>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/checkouts">Back to patients</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{patient.email}</p>
          </div>

          {latestNextAppointment ? (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-700" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Next appointment
                  </p>
                </div>

                <p className="text-base font-semibold text-emerald-950">
                  {formatOptionalDate(latestNextAppointment)}
                </p>

                <p className="text-sm text-emerald-800">
                  Open this appointment to record the service and payment for
                  that day.
                </p>

                <Button
                  onClick={openVisitDialog}
                  className="mt-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Open appointment
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Visits: {checkouts.length}
            </Badge>
            <Badge variant="success" className="rounded-full">
              Treatment total: {formatCurrency(totals.treatmentTotal)}
            </Badge>
            <Badge variant="warning" className="rounded-full">
              Remaining: {formatCurrency(totals.remainingAmount)}
            </Badge>
          </div>

          <Button
            onClick={openVisitDialog}
            className="rounded-lg w-[160px] ml-[auto] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isFirstVisit ? "Add First Visit" : "Add Next Visit"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium">How this works</p>
        <p className="mt-1">
          The first visit stores the full treatment cost once. Each follow-up
          visit is opened from the next appointment date, then the doctor adds
          the service and payment for that specific day. Leave the next
          appointment empty if this is the last appointment.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Visit history</h2>
          <p className="text-sm text-gray-500">
            Service, visit date, next appointment, total cost, amount paid, and
            payment status.
          </p>
        </div>

        {checkouts.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-500">No visits yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Visit date
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Next appointment
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Total cost
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Paid now
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Payment status
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map((checkout) => (
                  <tr key={checkout._id} className="border-b last:border-0">
                    <td className="px-6 py-4 text-gray-900">
                      {checkout.serviceProvided?.trim() || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(checkout.appointmentDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {checkout.nextAppointmentDate
                        ? formatDate(checkout.nextAppointmentDate)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(checkout.invoiceAmount)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(checkout.amountPaid)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          checkout.paymentStatus === "paid"
                            ? "success"
                            : checkout.paymentStatus === "partial"
                              ? "secondary"
                              : "warning"
                        }
                        className="rounded-full"
                      >
                        {checkout.paymentStatus === "paid"
                          ? "Paid"
                          : checkout.paymentStatus === "partial"
                            ? "Partial"
                            : "Unpaid"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isFirstVisit ? "Add First Visit" : "Add Next Visit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Visit date *</Label>
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
              {!isFirstVisit && latestNextAppointment ? (
                <p className="text-xs text-emerald-700">
                  Prefilled from the scheduled next appointment.
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Service provided *</Label>
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
              <p className="text-xs text-slate-500">
                Add the service that was performed on this specific day.
              </p>
              {!isFirstVisit && latestService ? (
                <p className="text-xs text-amber-700">
                  Previous visit service was: {latestService}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isFirstVisit ? (
                <div className="space-y-1.5">
                  <Label>{visitCostLabel}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.invoiceAmount}
                    onChange={(e) => {
                      const nextAmount = e.target.value;
                      setForm((prev) => {
                        const shouldMirrorPayment =
                          Number(prev.amountPaid) === 0;
                        const mirroredPayment = shouldMirrorPayment
                          ? nextAmount
                          : prev.amountPaid;

                        return {
                          ...prev,
                          invoiceAmount: nextAmount,
                          amountPaid: mirroredPayment,
                          paymentStatus: resolvePaymentStatus(
                            Number(nextAmount) || 0,
                            Number(mirroredPayment) || 0
                          ),
                        };
                      });
                    }}
                  />
                  <p className="text-xs text-slate-500">{visitCostHelp}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>{visitCostLabel}</Label>
                  <Input type="number" min="0" value="0" disabled />
                  <p className="text-xs text-slate-500">{visitCostHelp}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{paymentLabel}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.amountPaid}
                  onChange={(e) => {
                    const nextAmount = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      amountPaid: nextAmount,
                      paymentStatus: resolvePaymentStatus(
                        Number(prev.invoiceAmount) || 0,
                        Number(nextAmount) || 0
                      ),
                    }));
                  }}
                />
                <p className="text-xs text-slate-500">
                  Enter the amount collected for this appointment day.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Next appointment date</Label>
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
              <p className="text-xs text-slate-500">
                Fill this only if the doctor wants another appointment. Leave it
                blank to finish treatment.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Payment status</Label>
              <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {form.paymentStatus === "paid"
                  ? "Paid"
                  : form.paymentStatus === "partial"
                    ? "Partial"
                    : "Unpaid"}
                <span className="ml-2 text-xs text-slate-500">
                  Automatically calculated from the amount paid.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email subject</Label>
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
              <Label>Email body (sent to patient)</Label>
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
              <Button onClick={handleCreateCheckout} disabled={!canSaveVisit}>
                {saving
                  ? "Saving..."
                  : isFirstVisit
                    ? "Save First Visit"
                    : "Save Appointment"}
              </Button>
            </div>

            <input type="hidden" value={form.patientId} readOnly />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
