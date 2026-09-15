"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";

interface Setting {
  key: string;
  value: string | null;
}

interface SettingFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
}

const GENERAL_FIELDS: SettingFieldDef[] = [
  { key: "site_name", label: "Nama Situs", placeholder: "HostIDMurah" },
  { key: "contact_whatsapp", label: "WhatsApp Kontak", placeholder: "6281234567890" },
  { key: "referral_bonus_amount", label: "Bonus Referral (Rp)", type: "number" },
];

const SMTP_FIELDS: SettingFieldDef[] = [
  { key: "smtp_host", label: "SMTP Host", placeholder: "smtp.gmail.com" },
  { key: "smtp_port", label: "SMTP Port", type: "number", placeholder: "587" },
];

const BILLING_DISCOUNTS_KEY = "billing_discounts";
const DEFAULT_BILLING_DISCOUNTS: [number, number][] = [[1, 0], [3, 5], [6, 10], [12, 15]];

const KNOWN_KEYS = new Set([...GENERAL_FIELDS, ...SMTP_FIELDS].map((f) => f.key).concat(BILLING_DISCOUNTS_KEY));

function parseBillingDiscounts(raw: string | undefined): [number, number][] {
  if (!raw) return DEFAULT_BILLING_DISCOUNTS;
  try {
    const obj = JSON.parse(raw) as Record<string, number>;
    const entries = Object.entries(obj)
      .map(([months, pct]) => [Number(months), Number(pct)] as [number, number])
      .filter(([months]) => Number.isFinite(months) && months > 0)
      .sort((a, b) => a[0] - b[0]);
    return entries.length > 0 ? entries : DEFAULT_BILLING_DISCOUNTS;
  } catch {
    return DEFAULT_BILLING_DISCOUNTS;
  }
}

function humanizeKey(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Setting[]>("/admin/settings");
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value ?? ""; });
      setValues(map);
      setOriginal(map);
    } catch {
      toast.error("Gagal memuat pengaturan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const extraKeys = Object.keys(values).filter((k) => !KNOWN_KEYS.has(k));

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const billingDiscounts = parseBillingDiscounts(values[BILLING_DISCOUNTS_KEY]);

  const handleBillingDiscountChange = (months: number, pct: number) => {
    const updated = billingDiscounts.map(([m, p]) => (m === months ? [m, pct] : [m, p]));
    const obj: Record<string, number> = {};
    updated.forEach(([m, p]) => { obj[String(m)] = p; });
    handleChange(BILLING_DISCOUNTS_KEY, JSON.stringify(obj));
  };

  const handleSave = async () => {
    const changedKeys = Object.keys(values).filter((k) => values[k] !== original[k]);
    if (changedKeys.length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(
        changedKeys.map((key) => api.put("/admin/settings", { key, value: values[key] }))
      );
      toast.success("Pengaturan berhasil disimpan.");
      await load();
    } catch {
      toast.error("Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: SettingFieldDef) => (
    <div key={field.key} className="space-y-1.5">
      <Label>{field.label}</Label>
      <Input
        type={field.type ?? "text"}
        value={values[field.key] ?? ""}
        placeholder={field.placeholder}
        onChange={(e) => handleChange(field.key, e.target.value)}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Konfigurasi situs HostIDMurah.</p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Konfigurasi situs HostIDMurah.</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Umum</CardTitle>
          <CardDescription>Pengaturan dasar situs dan referral.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {GENERAL_FIELDS.map(renderField)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diskon Durasi Langganan</CardTitle>
          <CardDescription>
            Diskon per durasi order VPS (%). Berlaku langsung ke harga yang ditagih ke pelanggan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {billingDiscounts.map(([months, pct]) => (
              <div key={months} className="space-y-1.5">
                <Label>{months} Bulan</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={pct}
                    onChange={(e) => handleBillingDiscountChange(months, Number(e.target.value))}
                    className="pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMTP</CardTitle>
          <CardDescription>Konfigurasi server email untuk notifikasi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SMTP_FIELDS.map(renderField)}
        </CardContent>
      </Card>

      {extraKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lainnya</CardTitle>
            <CardDescription>Pengaturan tambahan yang tersimpan di sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {extraKeys.map((key) => renderField({ key, label: humanizeKey(key) }))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
