"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Tag, Server, ChevronRight, ShieldCheck, Clock, Headphones, Pencil, Lock, Globe, Loader2, Wallet, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Static (non-VPS) product data — belum terhubung ke backend ──────────────

const hostingSharedPlans = [
  { id: "hosting-shared-starter",  name: "Shared Starter",  basePrice: 19000, spec: "2 GB SSD · 1 Domain · Unlimited BW" },
  { id: "hosting-shared-business", name: "Shared Business", basePrice: 39000, spec: "5 GB SSD · 3 Domain · Unlimited BW" },
  { id: "hosting-shared-pro",      name: "Shared Pro",      basePrice: 69000, spec: "15 GB SSD · 10 Domain · Unlimited BW" },
];

const hostingWordPressPlan = [
  { id: "hosting-wp-starter",  name: "WP Starter",  basePrice: 29000, spec: "5 GB SSD · 1 Site · 10.000 kunjungan" },
  { id: "hosting-wp-business", name: "WP Business", basePrice: 59000, spec: "15 GB SSD · 3 Site · 50.000 kunjungan" },
  { id: "hosting-wp-pro",      name: "WP Pro",      basePrice: 99000, spec: "30 GB SSD · Unlimited Site · 200.000 kunjungan" },
];

const hostingCloudPlans = [
  { id: "hosting-cloud-lite",     name: "Cloud Lite",     basePrice: 49000,  spec: "1 vCPU · 1 GB · 20 GB SSD · 2 TB BW" },
  { id: "hosting-cloud-business", name: "Cloud Business", basePrice: 99000,  spec: "2 vCPU · 2 GB · 40 GB SSD · 4 TB BW" },
  { id: "hosting-cloud-pro",      name: "Cloud Pro",      basePrice: 179000, spec: "4 vCPU · 4 GB · 80 GB SSD · 8 TB BW" },
];

// Diskon durasi — diambil dari backend (admin bisa atur), ini cuma fallback
// sebelum data live selesai dimuat.
const DEFAULT_DURATIONS = [
  { months: 1,  label: "1 Bulan",  discount: 0,  badge: null as string | null },
  { months: 3,  label: "3 Bulan",  discount: 5,  badge: "Hemat 5%" },
  { months: 6,  label: "6 Bulan",  discount: 10, badge: "Hemat 10%" },
  { months: 12, label: "12 Bulan", discount: 15, badge: "Terbaik 🔥" },
];

const linuxDistros = [
  { id: "ubuntu-22", name: "Ubuntu 22.04 LTS", logo: "🟠" },
  { id: "ubuntu-24", name: "Ubuntu 24.04 LTS", logo: "🟠" },
  { id: "debian-12", name: "Debian 12",         logo: "🔴" },
  { id: "alma-9",    name: "AlmaLinux 9",        logo: "🔵" },
  { id: "rocky-9",   name: "Rocky Linux 9",      logo: "🟢" },
  { id: "fedora-39", name: "Fedora 39",           logo: "🔵" },
];

const windowsDistros = [
  { id: "win-2022", name: "Windows Server 2022", logo: "🪟" },
  { id: "win-2019", name: "Windows Server 2019", logo: "🪟" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductType = "linux" | "windows" | "hosting-shared" | "hosting-wordpress" | "hosting-cloud";
type Plan = { id: string; name: string; basePrice: number; spec: string; dbId?: number; osOptions?: string };
type Duration = { months: number; label: string; discount: number; badge: string | null };
type Distro = typeof linuxDistros[0];

function buildDurations(map: Record<string, number>): Duration[] {
  const entries = Object.entries(map)
    .map(([months, discount]) => ({ months: Number(months), discount }))
    .filter((e) => Number.isFinite(e.months) && e.months > 0)
    .sort((a, b) => a.months - b.months);
  if (entries.length === 0) return DEFAULT_DURATIONS;
  const maxDiscount = Math.max(...entries.map((e) => e.discount));
  return entries.map((e) => ({
    months: e.months,
    label: `${e.months} Bulan`,
    discount: e.discount,
    badge: e.discount === 0 ? null : e.discount === maxDiscount ? "Terbaik 🔥" : `Hemat ${e.discount}%`,
  }));
}

interface DbPackage {
  id: number;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  price_monthly: number;
  os_type?: string;
  server_type?: string;
  os_options?: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  account_number: string;
  account_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return Number(n).toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function isVpsType(type: ProductType): type is "linux" | "windows" {
  return type === "linux" || type === "windows";
}

function getProductMeta(type: ProductType) {
  const isHosting = type.startsWith("hosting");
  const labels: Record<ProductType, { category: string; back: string; title: string }> = {
    "linux":             { category: "VPS Linux",          back: "VPS",     title: "Konfigurasi VPS Linux" },
    "windows":           { category: "VPS Windows",        back: "VPS",     title: "Konfigurasi VPS Windows" },
    "hosting-shared":    { category: "Shared Hosting",     back: "Hosting", title: "Konfigurasi Shared Hosting" },
    "hosting-wordpress": { category: "WordPress Hosting",  back: "Hosting", title: "Konfigurasi WordPress Hosting" },
    "hosting-cloud":     { category: "Cloud Hosting",      back: "Hosting", title: "Konfigurasi Cloud Hosting" },
  };
  return { ...labels[type], isHosting };
}

function staticPlansForType(type: ProductType): Plan[] {
  switch (type) {
    case "hosting-shared":    return hostingSharedPlans;
    case "hosting-wordpress": return hostingWordPressPlan;
    case "hosting-cloud":     return hostingCloudPlans;
    default:                  return [];
  }
}

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
        <CardTitle className={cn("text-base", status === "locked" && "text-muted-foreground/50")}>
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
  const { user, isLoading: authLoading } = useAuth();

  // Parse URL params
  const rawType  = searchParams.get("type") ?? "linux";
  const planParam = searchParams.get("plan") ?? "";

  const productType: ProductType = (
    ["linux", "windows", "hosting-shared", "hosting-wordpress", "hosting-cloud"].includes(rawType)
      ? rawType
      : "linux"
  ) as ProductType;

  const { category, back, title, isHosting } = getProductMeta(productType);
  const isVps = isVpsType(productType);

  // ─── Real VPS packages dari backend ───────────────────────────────────────
  const [dbPackages, setDbPackages] = useState<DbPackage[] | null>(null);
  const [packagesLoading, setPackagesLoading] = useState(isVps);

  useEffect(() => {
    if (!isVps) return;
    setPackagesLoading(true);
    api
      .get<DbPackage[]>("/packages", { params: { active_only: true } })
      .then((res) => setDbPackages(res.data))
      .catch(() => toast.error("Gagal memuat daftar paket."))
      .finally(() => setPackagesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVps]);

  const vpsPlans: Plan[] = (dbPackages ?? [])
    .filter((p) => p.os_type === productType)
    .sort((a, b) => a.price_monthly - b.price_monthly)
    .map((p) => ({
      id: String(p.price_monthly),
      dbId: p.id,
      name: p.name,
      basePrice: Number(p.price_monthly),
      spec: `${p.cpu} · ${p.ram} · ${p.storage}`,
      osOptions: p.os_options,
    }));

  const plans = isVps ? vpsPlans : staticPlansForType(productType);

  // ─── Form state ────────────────────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan]         = useState<Plan | null>(null);
  const [durations, setDurations]               = useState<Duration[]>(DEFAULT_DURATIONS);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(DEFAULT_DURATIONS[0]);

  // Diskon durasi — diambil dari backend supaya sinkron dengan yang ditagih
  useEffect(() => {
    api
      .get<Record<string, number>>("/billing-discounts")
      .then((res) => {
        const built = buildDurations(res.data);
        setDurations(built);
        setSelectedDuration((prev) => built.find((d) => d.months === prev.months) ?? built[0]);
      })
      .catch(() => {
        // biarkan pakai DEFAULT_DURATIONS kalau gagal fetch
      });
  }, []);
  const [selectedDistro, setSelectedDistro]     = useState<Distro>(linuxDistros[0]);
  const [wantIpStatic, setWantIpStatic]         = useState(false);
  const [domain, setDomain]                     = useState("");
  const [hostname, setHostname]                 = useState("");
  const [customerName, setCustomerName]         = useState("");
  const [customerEmail, setCustomerEmail]       = useState("");
  const [customerPhone, setCustomerPhone]       = useState("");
  const [note, setNote]                         = useState("");
  const [activeStep, setActiveStep]             = useState(1);
  const [maxStep, setMaxStep]                   = useState(1);

  // ─── Payment (VPS real order) ──────────────────────────────────────────────
  const [paymentMode, setPaymentMode] = useState<"balance" | "transfer">("balance");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (!isVps) return;
    api
      .get<PaymentMethod[]>("/payment-methods")
      .then((res) => {
        setPaymentMethods(res.data);
        if (res.data.length > 0) setSelectedMethodId(res.data[0].id);
      })
      .catch(() => {});
  }, [isVps]);

  // Pre-select plan from URL once packages are loaded
  useEffect(() => {
    if (!planParam) return;
    if (isVps) {
      if (!dbPackages) return; // wait for load
      const found = vpsPlans.find((p) => p.id === planParam);
      if (found) {
        setSelectedPlan(found);
        setActiveStep(2);
        setMaxStep(2);
      }
    } else {
      const found = staticPlansForType(productType).find((p) => p.id === planParam);
      if (found) {
        setSelectedPlan(found);
        setActiveStep(2);
        setMaxStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planParam, dbPackages, productType]);

  // Auto-fill customer data from logged-in user
  useEffect(() => {
    if (user) {
      setCustomerName(user.name ?? "");
      setCustomerEmail(user.email ?? "");
      setCustomerPhone(user.phone ?? "");
    }
  }, [user]);

  // Reset distro/plan when OS type changes (VPS only)
  useEffect(() => {
    if (!isHosting) {
      setSelectedDistro(productType === "windows" ? windowsDistros[0] : linuxDistros[0]);
    }
    setSelectedPlan(null);
    setActiveStep(1);
    setMaxStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  // ─── Price calculation ─────────────────────────────────────────────────────
  const monthlyPrice        = selectedPlan?.basePrice ?? 0;
  const totalBeforeDiscount = monthlyPrice * selectedDuration.months;
  const totalDiscount       = Math.round(totalBeforeDiscount * selectedDuration.discount / 100);
  const totalPrice          = totalBeforeDiscount - totalDiscount;
  const effectiveMonthly    = selectedDuration.months > 0 ? Math.round(totalPrice / selectedDuration.months) : 0;

  const userBalance = user?.balance ?? 0;
  const canPayBalance = userBalance >= totalPrice;

  // ─── Step validity ─────────────────────────────────────────────────────────
  const step1Done = selectedPlan !== null;
  const missingFields = [
    customerName.trim().length < 2 && "Nama Lengkap",
    !customerEmail.includes("@") && "Alamat Email",
    customerPhone.trim().length < 8 && "No. WhatsApp",
    (isHosting ? domain.trim().length < 3 : hostname.trim().length < 3) && (isHosting ? "Nama Domain" : "Hostname Server"),
  ].filter((v): v is string => Boolean(v));
  const step3Done = missingFields.length === 0;

  function confirmStep1() {
    if (!step1Done) return;
    setActiveStep(2);
    setMaxStep((m) => Math.max(m, 2));
  }

  function confirmStep2() {
    setActiveStep(3);
    setMaxStep((m) => Math.max(m, 3));
  }

  async function handleCheckout() {
    if (!step3Done) return;

    // Alur lama (belum terhubung backend) untuk produk hosting
    if (!isVps) {
      const params = new URLSearchParams({
        plan:     selectedPlan!.name,
        duration: selectedDuration.label,
        os:       "—",
        hostname: domain,
        name:     customerName,
        email:    customerEmail,
        phone:    customerPhone,
        total:    String(totalPrice),
        months:   String(selectedDuration.months),
      });
      router.push(`/payment?${params.toString()}`);
      return;
    }

    // Alur nyata untuk VPS — perlu login
    if (!user) {
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (paymentMode === "transfer" && !selectedMethodId) {
      toast.error("Pilih metode transfer terlebih dahulu.");
      return;
    }
    if (paymentMode === "balance" && !canPayBalance) {
      toast.error("Saldo tidak cukup. Pilih transfer manual atau top up saldo dulu.");
      return;
    }

    const notesLines = [
      `OS: ${selectedDistro.logo} ${selectedDistro.name}`,
      `Hostname: ${hostname}`,
      wantIpStatic ? "Permintaan IP Public Static (dikonfirmasi & ditagih terpisah oleh admin)" : null,
      note ? `Catatan pelanggan: ${note}` : null,
    ].filter(Boolean);

    setIsSubmittingOrder(true);
    try {
      const { data: order } = await api.post("/orders", {
        package_id: selectedPlan!.dbId,
        billing_cycle: selectedDuration.months,
        notes: notesLines.join("\n"),
        payment_mode: paymentMode,
        use_balance: paymentMode === "balance",
        payment_method_id: paymentMode === "transfer" ? selectedMethodId : undefined,
      });

      const paymentParams = new URLSearchParams({ orderId: order.order_number ?? String(order.id) });
      const pi = order.payment_info as Record<string, number> | undefined;
      if (pi) {
        if (pi.amount !== undefined) paymentParams.set("amount", String(pi.amount));
        if (pi.unique_code !== undefined) paymentParams.set("unique_code", String(pi.unique_code));
        if (pi.total_transfer !== undefined) paymentParams.set("total_transfer", String(pi.total_transfer));
        if (pi.payment_method_id !== undefined) paymentParams.set("pmId", String(pi.payment_method_id));
      }
      router.push(`/payment?${paymentParams.toString()}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Gagal membuat pesanan. Coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function stepStatus(n: number): "active" | "done" | "locked" {
    if (n === activeStep) return "active";
    if (n < activeStep || n <= maxStep) return "done";
    return "locked";
  }

  const fallbackDistros = productType === "windows" ? windowsDistros : linuxDistros;
  const customOsNames = selectedPlan?.osOptions
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const distros: Distro[] = customOsNames && customOsNames.length > 0
    ? customOsNames.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        logo: productType === "windows" ? "🪟" : "🐧",
      }))
    : fallbackDistros;

  // Paket bisa punya daftar OS sendiri (diatur admin) — pastikan pilihan OS
  // selalu valid untuk paket yang sedang dipilih.
  useEffect(() => {
    if (distros.length > 0 && !distros.some((d) => d.id === selectedDistro.id)) {
      setSelectedDistro(distros[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan?.id]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <button className="hover:text-foreground" onClick={() => router.back()}>{back}</button>
            <ChevronRight className="h-3 w-3" />
            <span>Order</span>
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">
            {isHosting
              ? "Pilih paket dan durasi berlangganan yang sesuai kebutuhan."
              : "Pilih paket, durasi, dan sistem operasi yang sesuai kebutuhan."}
          </p>
          {user && (
            <p className="mt-2 text-sm text-primary">
              ✓ Data pemesan diisi otomatis dari akun Anda
            </p>
          )}
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
                {n === 1 ? "Pilih Paket" : n === 2 ? (isHosting ? "Durasi" : "Durasi & OS") : "Konfirmasi"}
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
                <StepHeader number={1} label="Pilih Paket" status={stepStatus(1)} onEdit={() => setActiveStep(1)} />
              </CardHeader>
              <CardContent>
                {activeStep === 1 ? (
                  <div className="space-y-4">
                    {/* VPS-only: OS toggle */}
                    {!isHosting && (
                      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                        {(["linux", "windows"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => router.replace(`/order?type=${type}`)}
                            className={cn(
                              "px-4 py-2 text-sm font-medium transition-colors",
                              productType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            )}
                          >
                            {type === "linux" ? "🐧 Linux" : "🪟 Windows"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Plan category label for hosting */}
                    {isHosting && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">{category}</span>
                      </div>
                    )}

                    {/* Loading state for VPS packages */}
                    {isVps && packagesLoading && (
                      <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat paket...
                      </div>
                    )}

                    {/* Plan list */}
                    {!(isVps && packagesLoading) && (
                      <div className="space-y-2">
                        {plans.length === 0 && (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            Belum ada paket tersedia untuk kategori ini.
                          </p>
                        )}
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
                                  <p className="text-xs text-muted-foreground mt-0.5">{plan.spec}</p>
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
                    )}

                    <button
                      onClick={confirmStep1}
                      disabled={!step1Done}
                      className={cn(buttonVariants(), "w-full", !step1Done && "opacity-50 cursor-not-allowed")}
                    >
                      Lanjut: Pilih Durasi {isHosting ? "" : "& OS"}
                    </button>
                  </div>
                ) : (
                  selectedPlan && (
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{selectedPlan.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedPlan.spec}</p>
                      </div>
                      <p className="font-bold text-primary">Rp {formatRupiah(selectedPlan.basePrice)}/bln</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* ── STEP 2: Durasi (& OS untuk VPS) ─────────────────────── */}
            <Card className={stepStatus(2) === "locked" ? "opacity-40 pointer-events-none" : ""}>
              <CardHeader className="pb-3">
                <StepHeader
                  number={2}
                  label={isHosting ? "Durasi Berlangganan" : "Durasi & Sistem Operasi"}
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

                    {/* VPS only: OS/distro picker */}
                    {!isHosting && (
                      <>
                        <Separator />
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

                        {/* Add-on: IP Static — VPS only, request saja (ditagih terpisah) */}
                        <div
                          onClick={() => setWantIpStatic((v) => !v)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all select-none",
                            wantIpStatic
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-dashed border-border hover:border-primary/50"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                            wantIpStatic ? "border-primary bg-primary" : "border-muted-foreground/40"
                          )}>
                            {wantIpStatic && (
                              <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Minta Add-on: IP Public Static</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Opsional. Biaya tambahan akan dikonfirmasi & ditagih terpisah oleh tim kami setelah order.
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      onClick={confirmStep2}
                      className={cn(buttonVariants(), "w-full")}
                    >
                      Lanjut: Konfirmasi Order
                    </button>
                  </div>
                ) : (
                  maxStep >= 2 && (
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-muted/30 px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Durasi</p>
                        <p className="font-semibold">{selectedDuration.label}</p>
                        {selectedDuration.discount > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">Hemat {selectedDuration.discount}%</Badge>
                        )}
                      </div>
                      {!isHosting && (
                        <div className="rounded-lg bg-muted/30 px-4 py-3">
                          <p className="text-xs text-muted-foreground mb-1">Sistem Operasi</p>
                          <p className="font-semibold">{selectedDistro.logo} {selectedDistro.name}</p>
                        </div>
                      )}
                      {!isHosting && wantIpStatic && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Add-on</p>
                          <p className="font-semibold text-primary">IP Public Static diminta (ditagih terpisah)</p>
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
                <StepHeader number={3} label="Info Pemesan & Konfirmasi" status={stepStatus(3)} />
              </CardHeader>
              <CardContent>
                {activeStep === 3 || maxStep >= 3 ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">Data Pemesan</p>
                        {user && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Diisi dari akun
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {user
                          ? "Data diambil dari akun Anda. Ubah jika diperlukan."
                          : "Isi data di bawah untuk mengirimkan informasi dan tagihan."}
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
                          <p className="text-xs text-muted-foreground">Info layanan dan invoice akan dikirim ke email ini.</p>
                        </div>

                        {/* Hostname (VPS) atau Domain (Hosting) */}
                        {isHosting ? (
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-medium">Nama Domain <span className="text-destructive">*</span></label>
                            <input
                              type="text"
                              value={domain}
                              onChange={(e) => setDomain(e.target.value)}
                              placeholder="contoh: namadomain.com"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">Domain yang akan diarahkan ke hosting ini.</p>
                          </div>
                        ) : (
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
                        )}

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-sm font-medium">Catatan <span className="text-muted-foreground font-normal">(opsional)</span></label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={isHosting ? "Misalnya: butuh migrasi dari hosting lain, CMS yang digunakan, dll." : "Misalnya: konfigurasi khusus, dll."}
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
                        ["Produk",     category],
                        ["Paket",      selectedPlan?.name ?? "—"],
                        ["Spesifikasi", selectedPlan?.spec ?? "—"],
                        ...(!isHosting ? [["OS", `${selectedDistro.logo} ${selectedDistro.name}`]] : []),
                        ["Durasi",     selectedDuration.label],
                        ...(!isHosting && wantIpStatic ? [["IP Static", "Diminta (ditagih terpisah)"]] : []),
                        [isHosting ? "Domain" : "Hostname", isHosting ? (domain || "—") : (hostname || "—")],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-medium text-right max-w-[55%]">{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment mode — VPS only, butuh login */}
                    {isVps && !authLoading && !user && (
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
                        <p className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Masuk untuk melanjutkan</p>
                        <p className="text-amber-700 dark:text-amber-400/80 text-xs">
                          Order VPS memerlukan akun agar bisa memantau status pesanan dan tagihan. Data yang sudah diisi akan tetap tersimpan di URL ini.
                        </p>
                      </div>
                    )}

                    {isVps && user && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">Metode Pembayaran</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <button
                            onClick={() => setPaymentMode("balance")}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                              paymentMode === "balance" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                            )}
                          >
                            <Wallet className="h-5 w-5 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Saldo Akun</p>
                              <p className="text-xs text-muted-foreground">Rp {formatRupiah(userBalance)}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => setPaymentMode("transfer")}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                              paymentMode === "transfer" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                            )}
                          >
                            <Landmark className="h-5 w-5 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Transfer Manual</p>
                              <p className="text-xs text-muted-foreground">Bank / e-wallet, verifikasi manual</p>
                            </div>
                          </button>
                        </div>

                        {paymentMode === "balance" && !canPayBalance && (
                          <p className="text-xs text-destructive">
                            Saldo tidak cukup (kurang Rp {formatRupiah(totalPrice - userBalance)}). Pilih transfer manual atau top up saldo dulu.
                          </p>
                        )}

                        {paymentMode === "transfer" && (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {paymentMethods.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => setSelectedMethodId(m.id)}
                                className={cn(
                                  "rounded-lg border p-3 text-left text-sm transition-all",
                                  selectedMethodId === m.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                                )}
                              >
                                <p className="font-medium">{m.name}</p>
                                <p className="text-xs text-muted-foreground">{m.account_name}</p>
                              </button>
                            ))}
                            {paymentMethods.length === 0 && (
                              <p className="text-xs text-muted-foreground col-span-2">Metode transfer belum tersedia.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isVps && !user ? (
                      <button
                        onClick={handleCheckout}
                        disabled={!step3Done}
                        className={cn(buttonVariants({ size: "lg" }), "w-full", !step3Done && "opacity-50 cursor-not-allowed")}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Masuk / Daftar untuk Order
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        disabled={!step3Done || isSubmittingOrder || (isVps && paymentMode === "balance" && !canPayBalance)}
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "w-full",
                          (!step3Done || isSubmittingOrder || (isVps && paymentMode === "balance" && !canPayBalance)) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSubmittingOrder ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                        ) : (
                          <><ShieldCheck className="mr-2 h-4 w-4" /> {isVps ? "Buat Pesanan" : "Lanjut ke Pembayaran"}</>
                        )}
                      </button>
                    )}

                    {!step3Done && (
                      <p className="text-xs text-center text-muted-foreground">
                        Lengkapi dulu: <span className="font-medium text-foreground">{missingFields.join(", ")}</span>
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

          {/* ── Right: sticky summary ─────────────────────────────────── */}
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
                        {!isHosting && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>OS</span>
                            <span className="text-xs text-right">{selectedDistro.name}</span>
                          </div>
                        )}
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
                    {(isVps && paymentMethods.length > 0
                      ? paymentMethods.map((m) => m.name)
                      : ["BCA", "Mandiri", "BNI", "BRI", "QRIS", "GoPay", "OVO", "Dana"]
                    ).map((m) => (
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
