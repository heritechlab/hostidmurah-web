"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/Header";
import { useAuth } from "@/context/AuthContext";

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      logout();
    }
  }, [isLoading, isAuthenticated, isAdmin, router, logout]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center px-4">
        <ShieldAlert className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Akun ini tidak memiliki akses admin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <ShieldAlert className="size-4 text-primary" />
          <span className="text-sm font-bold text-primary">Admin HostIDMurah</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AdminSidebar />
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
