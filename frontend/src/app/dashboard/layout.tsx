"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import {
  SidebarConfigProvider,
  useSidebarConfig,
} from "@/contexts/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarConfigProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarConfigProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { config } = useSidebarConfig();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
      className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
    >
      {config.side === "left" ? (
        <>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
          {/** main content */}
          <SidebarInset className="flex flex-1 flex-col px-5 bg-white min-h-[calc(100svh)] z-10">
            <div className="mb-4">
              <SiteHeader />
            </div>
            {children}
          </SidebarInset>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col p-5 bg-white min-h-[calc(100svh)]">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 px-5 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
        </>
      )}
    </SidebarProvider>
  );
}
