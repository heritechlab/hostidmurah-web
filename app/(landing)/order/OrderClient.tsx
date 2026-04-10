"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Tag, Server, ChevronRight, ShieldCheck, Clock, Headphones, Pencil, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const linuxPlans = [
  { id: "vps-l-s",   name: "VPS Linux S",   basePrice: 49000,  cpu: "1 vCPU",  ram: "1 GB",   storage: "25 GB NVMe",  bandwidth: "1 TB" },
  { id: "vps-l-m",   name: "VPS Linux M",   basePrice: 99000,  cpu: "2 vCPU",  ram: "4 GB",   storage: "80 GB NVMe",  bandwidth: "3 TB" },
  { id: "vps-l-l",   name: "VPS Linux L",   basePrice: 199000, cpu: "4 vCPU",  ram: "8 GB",   storage: "160 GB NVMe", bandwidth: "5 TB" },
  { id: "vps-l-xl",  name: "VPS Linux XL",  basePrice: 349000, cpu: "8 vCPU",  ram: "16 GB",  storage: "320 GB NVMe", bandwidth: "8 TB" },
  { id: "vps-l-xxl", name: "VPS Linux XXL", basePrice: 649000, cpu: "16 vCPU", ram: "32 GB",  storage: "640 GB NVMe", bandwidth: "10 TB" },
];

const windowsPlans = [
  { id: "vps-w-s",  name: "VPS Windows S",  basePrice: 149000, cpu: "2 vCPU",  ram: "4 GB",  storage: "80 GB NVMe",  bandwidth: "2 TB" },
  { id: "vps-w-m",  name: "VPS Windows M",  basePrice: 249000, cpu: "4 vCPU",  ram: "8 GB",  storage: "160 GB NVMe", bandwidth: "4 TB" },
  { id: "vps-w-l",  name: "VPS Windows L",  basePrice: 449000, cpu: "8 vCPU",  ram: "16 GB", storage: "320 GB NVMe", bandwidth: "6 TB" },
  { id: "vps-w-xl", name: "VPS Windows XL", basePrice: 799000, cpu: "16 vCPU", ram: "32 GB", storage: "640 GB NVMe", bandwidth: "10 TB" },
];

const durations = [
  { months: 1,  label: "1 Bulan",  discount: 0,  badge: null },
  { months: 3,  label: "3 Bulan",  discount: 10, badge: "Hemat 10%" },
  { months: 6,  label: "6 Bulan",  discount: 20, badge: "Hemat 20%" },
  { months: 12, label: "12 Bulan", discount: 30, badge: "Terbaik 🔥" },
];

const linuxDistros = [
  { id: "ubuntu-22", name: "Ubuntu 22.04 LTS", logo: "🟠" },
  { id: "ubuntu-24", name: "Ubuntu 24.04 LTS", logo: "🟠" },
  { id: "debian-12", name: "Debian 12",        logo: "🔴" },
  { id: "alma-9",    name: "AlmaLinux 9",       logo: "🔵" },
  { id: "rocky-9",   name: "Rocky Linux 9",     logo: "🟢" },
  { id: "fedora-39", name: "Fedora 39",          logo: "🔵" },
];

const windowsDistros = [
  { id: "win-2022", name: "Windows Server 2022", logo: "🪟" },
  { id: "win-2019", name: "Windows Server 2019", logo: "🪟" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return n.toLocaleString("id-ID");
}

type Plan = typeof linuxPlans[0];
type Duration = typeof durations[0];
type Distro = typeof linuxDistros[0];

// ─── Step Header ─────────────────────────────────────────────────────────────

function StepHeader({
  number, label, status, onEdit,
}: {
  number: number;
  label: string;
  status: "active" | "done" | "locked";
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
          status === "active" ? "bg-primary text-primary-foreground" :
          status === "done"   ? "bg-muted text-muted-foreground" :
                                "border border-border text-muted-foreground/50"
        )}>
          {status === "done" ? <CheckCircle className="h-3.5 w-3.5" /> :
           status === "locked" ? <Lock className="h-3 w-3" /> : number}
        </span>
        <CardTitle className={cn(
          "text-base",
          status === "locked" && "text-muted-foreground/50"
        )}>
          {label}
        </CardTitle>
      </div>
      {status === "done" && onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Pencil className="h-3 w-3" /> Ubah
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function OrderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "windows" ? "windows" : "linux";
  const initialPlanId = searchParams.get("plan") ?? "";

  // Form state — persisted across step navigation
  const [osType, setOsType]               = useState<"linux" | "windows">(initialType);
  const [selectedPlan, setSelectedPlan]   = useState<Plan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(durations[0]);
  const [selectedDistro, setSelectedDistro]     = useState<Distro>(linuxDistros[0]);
  const [addIpStatic, setAddIpStatic]     = useState(false);
  const [hostname, setHostname]           = useState("");
  const [customerName, setCustomerName]   = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote]                   = useState("");

  // Which step is currently expanded for editing (1, 2, 3)
  const [activeStep, setActiveStep] = useState(1);
  // Furthest step reached (controls lock/done state)
  const [maxStep, setMaxStep] = useState(1);

  const plans   = osType === "linux" ? linuxPlans : windowsPlans;
  const distros = osType === "linux" ? linuxDistros : windowsDistros;

  // Pre-select plan from URL
  useEffect(() => {
    if (initialPlanId) {
      const all = [...linuxPlans, ...windowsPlans];
      const found = all.find((p) => p.id === initialPlanId);
      if (found) {
        setSelectedPlan(found);
        setOsType(found.id.startsWith("vps-w") ? "windows" : "linux");
        setActiveStep(2);
        setMaxStep(2);
      }
    }
  }, []); // eslint-disable-line

  // Reset distro when OS type changes
  useEffect(() => {
    setSelectedDistro(osType === "linux" ? linuxDistros[0] : windowsDistros[0]);
  }, [osType]);

  // Price calculation
  const IP_STATIC_MONTHLY   = 100000;
  const monthlyPrice        = selectedPlan?.basePrice ?? 0;
  const totalBeforeDiscount = monthlyPrice * selectedDuration.months;
  const totalDiscount       = Math.round(totalBeforeDiscount * selectedDuration.discount / 100);
  const ipStaticTotal       = addIpStatic ? IP_STATIC_MONTHLY * selectedDuration.months : 0;
  const totalPrice          = totalBeforeDiscount - totalDiscount + ipStaticTotal;
  const effectiveMonthly    = selectedDuration.months > 0 ? Math.round(totalPrice / selectedDuration.months) : 0;

  // Step validity
  const step1Done = selectedPlan !== null;
  const step2Done = step1Done;
  const step3Done = hostname.trim().length >= 3 && customerName.trim().length >= 2
                 && customerEmail.includes("@") && customerPhone.trim().length >= 8;

  function confirmStep1() {
    if (!step1Done) return;
    setActiveStep(2);
    setMaxStep((m) => Math.max(m, 2));
  }

  function confirmStep2() {
    setActiveStep(3);
    setMaxStep((m) => Math.max(m, 3));
  }

  function handleCheckout() {
    if (!step3Done) return;
    const params = new URLSearchParams({
      plan:      selectedPlan!.name,
      duration:  selectedDuration.label,
      os:        selectedDistro.name,
      hostname,
      name:      customerName,
      email:     customerEmail,
      phone:     customerPhone,
      total:     String(totalPrice),
      months:    String(selectedDuration.months),
      ip_static: addIpStatic ? "1" : "0",
    });
    router.push(`/payment?${params.toString()}`);
  }

  function stepStatus(n: number): "active" | "done" | "locked" {
    if (n === activeStep) return "active";
    if (n < activeStep || n <= maxStep) return "done";
    return "locked";
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="hover:text-foreground cursor-pointer" onClick={() => router.back()}>VPS</span>
            <ChevronRight className="h-3 w-3" />
            <span>Order</span>
          </div>
          <h1 className="text-3xl font-bold">Konfigurasi Server Anda</h1>
          <p className="mt-1 text-muted-foreground">Pilih paket, durasi, dan sistem operasi yang sesuai kebutuhan.</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all",
                stepStatus(n) === "active" ? "bg-primary text-primary-foreground" :
                stepStatus(n) === "done"   ? "bg-primary/20 text-primary" :
                                              "bg-muted text-muted-foreground/50"
              )}>
                {stepStatus(n) === "done" ? <CheckCircle className="h-4 w-4" /> : n}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:block",
                stepStatus(n) === "active" ? "text-foreground" : "text-muted-foreground"
              )}>
                {n === 1 ? "Pilih Paket" : n === 2 ? "Durasi & OS" : "Konfirmasi"}
              </span>
              {i < 2 && <div className={cn("h-px flex-1", stepStatus(n) === "done" ? "bg-primary/40" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: steps */}
          <div className="lg:col-span-2 space-y-4">

            {/* ── STEP 1: Pilih Paket ───────────────────────────────────── */}
            <Card className={stepStatus(1) === "locked" ? "opacity-40 pointer-events-none" : ""}>
              <CardHeader className="pb-3">
                <StepHeader
                  number={1}
                  label="Pilih Paket"
                  status={stepStatus(1)}
                  onEdit={() => setActiveStep(1)}
                />
              </CardHeader>
              <CardContent>
                {activeStep === 1 ? (
                  <div className="space-y-4">
                    {/* OS toggle */}
                    <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                      {(["linux", "windows"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => { setOsType(type); setSelectedPlan(null); }}
                          className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors",
                            osType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          )}
                        >
                          {type === "linux" ? "🐧 Linux" : "🪟 Windows"}
                        </button>
                      ))}
                    </div>

                    {/* Plan list */}
                    <div className="space-y-2">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={cn(
                            "w-full text-left rounded-lg border p-4 transition-all",
                            selectedPlan?.id === plan.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                selectedPlan?.id === plan.id ? "border-primary" : "border-muted-foreground/40"
                              )}>
                                {selectedPlan?.id === plan.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{plan.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {plan.cpu} · {plan.ram} RAM · {plan.storage} · {plan.bandwidth}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="font-bold text-primary">Rp {formatRupiah(plan.basePrice)}</p>
                              <p className="text-xs text-muted-foreground">/bulan</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={confirmStep1}
                      disabled={!step1Done}
                      className={cn(buttonVariants(), "w-full", !step1Done && "opacity-50 cursor-not-allowed")}
                    >
                      Lanjut: Pilih Durasi &amp; OS
                    </button>
                  </div>
                ) : (
                  /* Collapsed summary */
                  selectedPlan && (
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{selectedPlan.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedPlan.cpu} · {selectedPlan.ram} · {selectedPlan.storage} · {osType === "linux" ? "🐧 Linux" : "🪟 Windows"}</p>
                      </div>
                      <p className="font-bold text-primary">Rp {formatRupiah(selectedPlan.basePrice)}/bln</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* ── STEP 2: Durasi & OS ───────────────────────────────────── */}
            <Card className={stepStatus(2) === "locked" ? "opacity-40 pointer-events-none" : ""}>
              <CardHeader className="pb-3">
                <StepHeader
                  number={2}
                  label="Durasi & Sistem Operasi"
                  status={stepStatus(2)}
                  onEdit={() => setActiveStep(2)}
                />
              </CardHeader>
              <CardContent>
                {activeStep === 2 ? (
                  <div className="space-y-6">
                    {/* Duration */}
                    <div>
                      <p className="text-sm font-medium mb-3">Pilih Durasi Berlangganan</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {durations.map((d) => {
                          const discountedMonthly = selectedPlan
                            ? Math.round(selectedPlan.basePrice * (1 - d.discount / 100))
                            : 0;
                          const isSelected = selectedDuration.months === d.months;
                          return (
                            <button
                              key={d.months}
                              onClick={() => setSelectedDuration(d)}
                              className={cn(
                                "relative rounded-lg border p-3 text-center transition-all pt-5",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              {d.badge && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                  <Badge className="text-[10px] px-1.5 py-0 whitespace-nowrap">
                                    <Tag className="h-2.5 w-2.5 mr-0.5" />{d.badge}
                                  </Badge>
                                </div>
                              )}
                              <p className="font-semibold text-sm">{d.label}</p>
                              {selectedPlan && (
                                <>
                                  <p className="text-xs text-primary font-bold mt-1">
                                    Rp {formatRupiah(discountedMonthly)}/bln
                                  </p>
                                  {d.discount > 0 && (
                                    <p className="text-[10px] text-muted-foreground line-through">
                                      Rp {formatRupiah(selectedPlan.basePrice)}/bln
                                    </p>
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* OS / Distro */}
                    <div>
                      <p className="text-sm font-medium mb-3">Pilih Sistem Operasi</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {distros.map((distro) => (
                          <button
                            key={distro.id}
                            onClick={() => setSelectedDistro(distro)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border p-3 text-sm transition-all text-left",
                              selectedDistro.id === distro.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <span className="text-xl">{distro.logo}</span>
                            <span className="font-medium text-xs leading-tight">{distro.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add-on: IP Public Static */}
                    <div
                      onClick={() => setAddIpStatic((v) => !v)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all select-none",
                        addIpStatic
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-dashed border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        addIpStatic ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}>
                        {addIpStatic && (
                          <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium">Add-on: IP Public Static</p>
                          <span className="text-sm font-bold text-primary">
                            +Rp {formatRupiah(IP_STATIC_MONTHLY * selectedDuration.months)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Rp {formatRupiah(IP_STATIC_MONTHLY)}/bulan — IP publik statis dedicated untuk server Anda
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={confirmStep2}
                      className={cn(buttonVariants(), "w-full")}
                    >
                      Lanjut: Konfirmasi Order
                    </button>
                  </div>
                ) : (
                  /* Collapsed summary */
                  maxStep >= 2 && (
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-muted/30 px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Durasi</p>
                        <p className="font-semibold">{selectedDuration.label}</p>
                        {selectedDuration.discount > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">Hemat {selectedDuration.discount}%</Badge>
                        )}
                      </div>
                      <div className="rounded-lg bg-muted/30 px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Sistem Operasi</p>
                        <p className="font-semibold">{selectedDistro.logo} {selectedDistro.name}</p>
                      </div>
                      {addIpStatic && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Add-on</p>
                          <p className="font-semibold text-primary">IP Public Static (+Rp {formatRupiah(IP_STATIC_MONTHLY)}/bln)</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* ── STEP 3: Konfirmasi + Info Pemesan ────────────────────── */}
            <Card className={stepStatus(3) === "locked" ? "opacity-40 pointer-events-none" : ""}>
              <CardHeader className="pb-3">
                <StepHeader
                  number={3}
                  label="Info Pemesan & Konfirmasi"
                  status={stepStatus(3)}
                />
              </CardHeader>
              <CardContent>
                {activeStep === 3 || maxStep >= 3 ? (
                  <div className="space-y-5">
                    {/* Customer info */}
                    <div>
                      <p className="text-sm font-semibold mb-3">Data Pemesan</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Isi data di bawah untuk mengirimkan informasi server dan tagihan. Tidak perlu daftar akun untuk saat ini.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Nama Lengkap <span className="text-destructive">*</span></label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">No. WhatsApp <span className="text-destructive">*</span></label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="08123456789"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-sm font-medium">Alamat Email <span className="text-destructive">*</span></label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <p className="text-xs text-muted-foreground">Info server dan invoice akan dikirim ke email ini.</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-sm font-medium">Hostname Server <span className="text-destructive">*</span></label>
                          <input
                            type="text"
                            value={hostname}
                            onChange={(e) => setHostname(e.target.value)}
                            placeholder="contoh: server-web-produksi"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-sm font-medium">Catatan <span className="text-muted-foreground font-normal">(opsional)</span></label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Misalnya: butuh IP tambahan, konfigurasi khusus, dll."
                            rows={2}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Order summary recap */}
                    <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
                      <p className="font-semibold">Ringkasan Pesanan</p>
                      {[
                        ["Paket",       selectedPlan?.name ?? "—"],
                        ["Spesifikasi", selectedPlan ? `${selectedPlan.cpu} · ${selectedPlan.ram} · ${selectedPlan.storage}` : "—"],
                        ["OS",         `${selectedDistro.logo} ${selectedDistro.name}`],
                        ["Durasi",     selectedDuration.label],
                        ["IP Static",  addIpStatic ? `Ya (+Rp ${formatRupiah(IP_STATIC_MONTHLY)}/bln)` : "Tidak"],
                        ["Hostname",   hostname || "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-medium text-right max-w-[55%]">{v}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={!step3Done}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full",
                        !step3Done && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Lanjut ke Pembayaran
                    </button>

                    {!step3Done && (
                      <p className="text-xs text-center text-muted-foreground">
                        Lengkapi semua field yang wajib diisi (*) untuk melanjutkan.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    Selesaikan langkah sebelumnya untuk melanjutkan.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right: sticky summary ────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Ringkasan Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPlan ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedPlan.name}</span>
                          <span>Rp {formatRupiah(monthlyPrice)}/bln</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durasi</span>
                          <span>{selectedDuration.label}</span>
                        </div>
                        {selectedDuration.discount > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Diskon {selectedDuration.discount}%</span>
                            <span>- Rp {formatRupiah(totalDiscount)}</span>
                          </div>
                        )}
                        {addIpStatic && (
                          <div className="flex justify-between text-primary">
                            <span>IP Public Static</span>
                            <span>+ Rp {formatRupiah(ipStaticTotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>OS</span>
                          <span className="text-xs text-right">{selectedDistro.name}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">Rp {formatRupiah(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Efektif per bulan</span>
                          <span>Rp {formatRupiah(effectiveMonthly)}/bln</span>
                        </div>
                        {selectedDuration.discount > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                            Hemat Rp {formatRupiah(totalDiscount)} dengan paket {selectedDuration.label}!
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Pilih paket untuk melihat harga
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Trust signals */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-3">
                  {[
                    { icon: Clock, title: "Aktif dalam 5 menit", desc: "Provisioning otomatis setelah bayar" },
                    { icon: ShieldCheck, title: "Garansi 7 hari", desc: "Uang kembali jika tidak puas" },
                    { icon: Headphones, title: "Support 24/7", desc: "Tim siap membantu kapan saja" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-2 text-sm">
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment methods */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Metode Pembayaran</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["BCA", "Mandiri", "BNI", "BRI", "QRIS", "GoPay", "OVO", "Dana"].map((m) => (
                      <span key={m} className="text-xs border border-border rounded px-2 py-0.5 bg-background font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
