"use client";

import * as React from "react";
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  LayoutTemplate,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SidebarNotification } from "@/components/layout/sidebar-notification";

import { NavMain } from "@/components/layout/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "ShadcnStore",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboard",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Patients",
          url: "/dashboard/patients",
          icon: Users,
        },
        {
          title: "Checkups",
          url: "/dashboard/checkouts",
          icon: CheckSquare,
        },
        {
          title: "Blogs",
          url: "/dashboard/posts",
          icon: MessageCircle,
        },
      ],
    },
    {
      label: "Bookings",
      items: [
        {
          title: "Appointments",
          url: "/dashboard/bookings",
          icon: Calendar,
        },
      ],
    },
    {
      label: "Messages",
      items: [
        {
          title: "Contact Messages",
          url: "/dashboard/contacts",
          icon: Mail,
        },
      ],
    },
    {
      label: "Landing Page",
      items: [
        {
          title: "Landing Page",
          url: "/dashboard/landing-page",
          icon: LayoutTemplate,
        },
      ],
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ShadcnStore</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
