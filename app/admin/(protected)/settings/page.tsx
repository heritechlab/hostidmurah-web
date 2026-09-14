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

const KNOWN_KEYS = new Set([...GENERAL_FIELDS, ...SMTP_FIELDS].map((f) => f.key));

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
