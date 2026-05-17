"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCheckouts, getPatients } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { formatDate } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface Checkout {
  _id: string;

  patientId: {
    _id: string;
  };

  patientName: string;
  patientEmail: string;

  serviceProvided?: string;
  nextAppointmentDate?: string;
  followUpNotes?: string;

  createdAt?: string;
}

interface Patient {
  _id?: string;
  name?: string;
  email?: string;
  gender?: string;
  lastVisit?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function toDateKey(input: string | Date | undefined) {
  if (!input) return "";

  const d = new Date(input);

  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().slice(0, 10);
}

// ─── Page ──────────────────────────────────────────────────────

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const todayKey = toDateKey(new Date());

  const [selectedCheckoutDate, setSelectedCheckoutDate] =
    useState<string>(todayKey);

  const [nextCheckoutDate, setNextCheckoutDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    return toDateKey(d);
  });

  // ─── Load Patients ──────────────────────────────────────────

  async function loadPatients(searchTerm?: string) {
    try {
      setLoading(true);

      const res = await getPatients(searchTerm);

      setPatients(res.data || []);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Load Checkouts ─────────────────────────────────────────

  async function loadCheckouts() {
    try {
      setLoading(true);

      const res = await getCheckouts();

      setCheckouts(res.data || []);
    } catch (err) {
      console.error("Failed to load checkouts:", err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Effects ────────────────────────────────────────────────

  useEffect(() => {
    loadPatients();
    loadCheckouts();
  }, []);

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Checkouts
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage invoices and patient payments
          </p>
        </div>
      </div>

      {/* Toolbar */}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1.5">
            <Label>Checkout Date</Label>

            <Input
              type="date"
              value={selectedCheckoutDate}
              onChange={(e) =>
                setSelectedCheckoutDate(e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Next Checkout Date</Label>

            <Input
              type="date"
              value={nextCheckoutDate}
              onChange={(e) =>
                setNextCheckoutDate(e.target.value)
              }
            />
          </div>
        </div>

        <div>
          <p className="text-lg text-gray-700">
            List of all patients
          </p>
        </div>
      </div>

      {/* Table */}

      <Card className="border-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-100">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">
              Loading...
            </p>
          ) : checkouts.length === 0 ? (
            <p className="p-6 text-muted-foreground">
              No checkouts found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b-2 border-emerald-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Patient
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Service
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Next Appointment
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {checkouts.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-colors"
                    >
                      {/* Patient */}

                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/checkouts/${c.patientId?._id}`}
                          className="block hover:underline"
                        >
                          <p className="font-semibold text-gray-900">
                            {c.patientName}
                          </p>
                        </Link>

                        <p className="text-xs text-gray-500">
                          {c.patientEmail}
                        </p>
                      </td>

                      {/* Service */}

                      <td className="px-6 py-4 text-gray-700">
                        {c.serviceProvided || "N/A"}
                      </td>

                      {/* Next Appointment */}

                      <td className="px-6 py-4 text-gray-700">
                        {c.nextAppointmentDate
                          ? formatDate(c.nextAppointmentDate)
                          : "N/A"}
                      </td>

                      {/* Created */}

                      <td className="px-6 py-4 text-gray-700">
                        {c.createdAt
                          ? formatDate(c.createdAt)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}