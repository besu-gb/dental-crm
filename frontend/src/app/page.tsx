// src/app/page.tsx
// Redirect visitors from "/" to the dashboard

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
