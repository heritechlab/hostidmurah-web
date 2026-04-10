"use client";

import { Gift, Copy, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ReferralPage() {
  const { user } = useAuth();
  const referralCode = user?.referral_code ?? "—";
  const referralLink = `https://hostidmurah.web.id/register?ref=${referralCode}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Program Referral</h1>
        <p className="text-sm text-muted-foreground">
          Ajak teman dan dapatkan komisi setiap kali mereka order VPS.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Referral", value: "0 orang", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Komisi Diterima", value: "Rp 0", icon: Wallet, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${s.bg}`}>
              <s.icon className={`size-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral code */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Kode Referral Anda</h2>
        <div className="flex gap-2">
          <Input value={referralCode} readOnly className="font-mono font-bold tracking-widest text-center" />
          <Button variant="outline" size="icon" onClick={() => copy(referralCode, "Kode referral")}>
            <Copy className="size-4" />
          </Button>
        </div>

        <h2 className="font-semibold">Link Referral</h2>
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="text-sm" />
          <Button variant="outline" size="icon" onClick={() => copy(referralLink, "Link referral")}>
            <Copy className="size-4" />
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Cara Kerja</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Bagikan kode atau link referral Anda ke teman." },
            { step: "2", text: "Teman mendaftar menggunakan kode referral Anda." },
            { step: "3", text: "Teman melakukan order VPS pertama mereka." },
            { step: "4", text: "Anda mendapatkan komisi otomatis ke saldo akun." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {item.step}
              </div>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
