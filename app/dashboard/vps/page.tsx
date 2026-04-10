"use client";

import { Server, Plus, Power, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VPS Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola semua VPS aktif Anda.</p>
        </div>
        <Link href="/order" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          <Plus className="size-4" />
          Order VPS
        </Link>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
        <Server className="size-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Belum ada VPS aktif</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
          Setelah order VPS diproses, server Anda akan muncul di sini beserta info IP, hostname, dan kontrol server.
        </p>
        <Link href="/order" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus className="size-4" />
          Order VPS Pertama
        </Link>
      </div>

      {/* Legend info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Fitur yang tersedia</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Power, label: "Power On/Off/Restart", desc: "Kontrol status server kapan saja" },
            { icon: RefreshCw, label: "Reinstall OS", desc: "Install ulang OS tanpa kehilangan IP" },
            { icon: ExternalLink, label: "Console Access", desc: "Akses via VNC langsung dari browser" },
          ].map((f) => (
            <div key={f.label} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <f.icon className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
