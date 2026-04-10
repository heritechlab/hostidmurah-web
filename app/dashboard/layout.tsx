import type { ReactNode } from "react";
import Link from "next/link";
import { Server } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <Server className="size-4" />
            <span className="text-sm">HostIDMurah</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
