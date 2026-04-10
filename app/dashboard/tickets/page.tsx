"use client";

import { useState } from "react";
import { Ticket, Plus, MessageCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const priorities = ["Rendah", "Sedang", "Tinggi"];
const categories = ["VPS", "Billing", "Teknis", "Umum"];

export default function TicketsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiket Support</h1>
          <p className="text-sm text-muted-foreground">
            Hubungi tim support kami untuk bantuan teknis.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Buka Tiket
        </Button>
      </div>

      {/* Create ticket form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Tiket Baru</h2>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subjek</Label>
            <Input id="subject" placeholder="Deskripsi singkat masalah Anda" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Pesan</Label>
            <textarea
              id="message"
              rows={5}
              placeholder="Jelaskan masalah Anda secara detail..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Kirim Tiket</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {["Semua", "Open", "Dijawab", "Ditutup"].map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              tab === "Semua"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
        <Ticket className="size-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Belum ada tiket</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Butuh bantuan? Tim support kami siap membantu 24/7.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Buka Tiket
          </Button>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 h-7 text-sm font-medium hover:bg-muted transition-colors"
            )}
          >
            <MessageCircle className="size-4" />
            Chat WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
