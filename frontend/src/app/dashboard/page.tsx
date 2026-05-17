"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  FileText,
  CreditCard,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";

const BarChart = dynamic(
  () => import("@/components/layout/BarChart"),
  { ssr: false }
);

const PieChart = dynamic(
  () => import("@/components/layout/PieChart"),
  { ssr: false }
);

const LineChart = dynamic(
  () => import("@/components/layout/LineChart"),
  { ssr: false }
);

const LineAreaChart = dynamic(
  () => import("@/components/layout/LineAreaChart"),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  patients: { total: number; active: number };
  bookings: { total: number; pending: number };
  posts: { published: number; draft: number };
  contacts: { unread: number };
  checkouts: {
    pendingInvoices: number;
    recentCheckouts: Array<{
      _id: string;
      patientName: string;
      appointmentDate: string;
      serviceProvided: string;
      invoiceAmount: number;
      invoicePaid: boolean;
    }>;
  };
}

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-.5 hover:shadow-md transition-shadow rounded-xl z-10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${color} shadow-md`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load stats: {error}. Make sure your backend is running.
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 bg-white z-[100]">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Patients"
          value={stats.patients.total}
          subtitle={`${stats.patients.active} active`}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.bookings.pending}
          subtitle={`${stats.bookings.total} total`}
          icon={CalendarCheck}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          title="Published Posts"
          value={stats.posts.published}
          subtitle={`${stats.posts.draft} drafts`}
          icon={FileText}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Unpaid Invoices"
          value={stats.checkouts.pendingInvoices}
          icon={CreditCard}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
        />
        <StatCard
          title="Unread Messages"
          value={stats.contacts.unread}
          icon={MessageSquare}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10">
        {/* Bar Chart */}
        <Card className="z-10 border-0.5 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                Bookings by Month
              </CardTitle>
              <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Monthly booking trends</p>
          </CardHeader>
          <CardContent className="relative">
            <BarChart
              chartData={[
                {
                  name: "Bookings",
                  data: [12, 15, 18, 22, 19, 25, 28],
                },
              ]}
              chartOptions={{
                chart: {
                  toolbar: { show: false },
                  sparkline: { enabled: false },
                },
                xaxis: {
                  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                yaxis: {
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                colors: ["#3b82f6"],
                grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
                dataLabels: { enabled: false },
                plotOptions: {
                  bar: { borderRadius: 8, columnWidth: "60%" },
                },
                states: {
                  hover: { filter: { type: "darken", value: 0.15 } },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0.5 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                Invoices Status
              </CardTitle>
              <div className="h-8 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Payment overview</p>
          </CardHeader>
          <CardContent className="relative">
            <PieChart
              chartData={[
                stats.checkouts.pendingInvoices,
                stats.checkouts.pendingInvoices,
              ]}
              chartOptions={{
                labels: ["Paid", "Unpaid"],
                colors: ["#10b981", "#ef4444"],
                chart: { sparkline: { enabled: false } },
                plotOptions: {
                  pie: { donut: { size: "75%" } },
                },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: "12px", fontWeight: "600" },
                },
                legend: {
                  position: "bottom",
                  labels: { colors: "#6b7280" },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="border-0.5 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                Revenue Trend
              </CardTitle>
              <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Weekly revenue performance
            </p>
          </CardHeader>
          <CardContent className="relative">
            <LineChart
              chartData={[
                {
                  name: "Revenue",
                  data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
                },
              ]}
              chartOptions={{
                chart: {
                  toolbar: { show: false },
                  sparkline: { enabled: false },
                },
                xaxis: {
                  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                yaxis: {
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                colors: ["#8b5cf6"],
                grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 3 },
                states: {
                  hover: { filter: { type: "darken", value: 0.15 } },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Area Chart */}
        <Card className="border-0.5 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                Patient Growth
              </CardTitle>
              <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              New patient acquisition
            </p>
          </CardHeader>
          <CardContent className="relative">
            <LineAreaChart
              chartData={[
                {
                  name: "New Patients",
                  data: [10, 15, 20, 18, 25, 30, 35],
                },
              ]}
              chartOptions={{
                chart: {
                  toolbar: { show: false },
                  sparkline: { enabled: false },
                },
                xaxis: {
                  categories: [
                    "Week 1",
                    "Week 2",
                    "Week 3",
                    "Week 4",
                    "Week 5",
                    "Week 6",
                    "Week 7",
                  ],
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                yaxis: {
                  labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                },
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 0.5,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                  },
                },
                colors: ["#06b6d4"],
                grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 2 },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Checkouts Table */}
      <Card className="border-1 shadow-lg rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Recent Checkouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.checkouts.recentCheckouts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No checkouts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100 bg-gray-50 rounded-lg">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Patient
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.checkouts.recentCheckouts.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {c.patientName}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {c.serviceProvided || "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(c.appointmentDate)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {formatCurrency(c.invoiceAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={c.invoicePaid ? "success" : "warning"}
                          className="rounded-full"
                        >
                          {c.invoicePaid ? "Paid" : "Unpaid"}
                        </Badge>
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
