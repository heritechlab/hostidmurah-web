import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Cpu, HardDrive, Globe, Shield, Monitor, MousePointer, RefreshCw, HeadphonesIcon, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cloud VPS Windows Indonesia — Harga Mulai Rp 149.000",
  description: "VPS Windows Server 2022 dengan RDP access, SSD NVMe, proteksi DDoS, dan administrator akses penuh. Cocok untuk MetaTrader, Remote Desktop, dan bisnis.",
};

const IP_STATIC_PRICE = "100.000";

const windowsPlans = [
  { id: "vps-w-s",  name: "VPS Windows S",  price: "149.000", cpu: "2 vCPU",  ram: "4 GB",  storage: "80 GB NVMe",  bandwidth: "2 TB" },
  { id: "vps-w-m",  name: "VPS Windows M",  price: "249.000", cpu: "4 vCPU",  ram: "8 GB",  storage: "160 GB NVMe", bandwidth: "4 TB", popular: true },
  { id: "vps-w-l",  name: "VPS Windows L",  price: "449.000", cpu: "8 vCPU",  ram: "16 GB", storage: "320 GB NVMe", bandwidth: "6 TB" },
  { id: "vps-w-xl", name: "VPS Windows XL", price: "799.000", cpu: "16 vCPU", ram: "32 GB", storage: "640 GB NVMe", bandwidth: "10 TB" },
];

const features = [
  { icon: Monitor,         title: "RDP Full Access",          desc: "Akses via Remote Desktop Protocol dengan hak administrator penuh." },
  { icon: Shield,          title: "DDoS Protection Gratis",   desc: "Mitigasi serangan otomatis hingga 1 Tbps tanpa biaya tambahan." },
  { icon: Cpu,             title: "AMD EPYC Processor",       desc: "Prosesor server terbaru untuk beban kerja Windows yang intensif." },
  { icon: HardDrive,       title: "SSD NVMe Gen 4",           desc: "Performa storage tinggi — ideal untuk SQL Server dan aplikasi berat." },
  { icon: MousePointer,    title: "GUI Desktop Penuh",        desc: "Windows Server 2022 dengan antarmuka grafis, mudah dikonfigurasi." },
  { icon: Globe,           title: "Datacenter Jakarta",       desc: "Latensi rendah ke seluruh Indonesia dengan koneksi IX Indonesia." },
  { icon: RefreshCw,       title: "Reinstall OS Kapan Saja",  desc: "Reinstall Windows Server dalam hitungan menit via panel Virtualizor." },
  { icon: HeadphonesIcon,  title: "Support 24/7",             desc: "Tim ahli siap membantu via tiket dan WhatsApp kapan saja." },
];

const useCases = [
  {
    title: "MetaTrader & Forex",
    icon: "📈",
    desc: "Jalankan MetaTrader 4/5 dan Expert Advisor (EA) 24/7 tanpa gangguan dengan koneksi stabil.",
    tags: ["MetaTrader 4", "MetaTrader 5", "EA Forex"],
  },
  {
    title: "Remote Desktop (RDP)",
    icon: "🖥️",
    desc: "Gunakan sebagai komputer virtual untuk kerja jarak jauh atau tim yang tersebar.",
    tags: ["Remote Work", "Team Access", "RDP Client"],
  },
  {
    title: "Game Server Windows",
    icon: "🎮",
    desc: "Hosting ARK, Rust, FiveM, atau game server berbasis Windows lainnya.",
    tags: ["ARK", "Rust", "FiveM", "SAMP"],
  },
  {
    title: "Aplikasi Bisnis",
    icon: "💼",
    desc: "Jalankan software akuntansi, ERP, atau aplikasi bisnis Windows 24/7.",
    tags: ["Accurate", "MYOB", "SAP B1"],
  },
  {
    title: "SQL Server & Database",
    icon: "🗄️",
    desc: "Microsoft SQL Server, MySQL for Windows, atau MSSQL Express untuk aplikasi enterprise.",
    tags: ["MSSQL", "MySQL", "PostgreSQL"],
  },
  {
    title: "Web Server IIS",
    icon: "🌐",
    desc: "Deploy aplikasi ASP.NET, .NET Core, atau Classic ASP di Internet Information Services.",
    tags: ["ASP.NET", ".NET Core", "IIS"],
  },
];

const included = [
  "RDP / Administrator access",
  "Panel Virtualizor",
  "Windows Server 2022",
  "Proteksi DDoS gratis",
  "Snapshot manual",
  "IPv4 dedicated",
  "Uptime SLA 99.9%",
  "Support 24/7",
  "Lisensi Windows termasuk",
  "rDNS / PTR record",
];

const faqs = [
  {
    q: "Apakah lisensi Windows sudah termasuk dalam harga?",
    a: "Ya, lisensi Windows Server 2022 sudah termasuk dalam paket. Anda tidak perlu membeli lisensi terpisah.",
  },
  {
    q: "Bagaimana cara mengakses VPS Windows?",
    a: "Akses via Remote Desktop Protocol (RDP) menggunakan aplikasi Remote Desktop Connection bawaan Windows, atau aplikasi RDP di Mac/Android/iOS.",
  },
  {
    q: "Apakah bisa install MetaTrader (MT4/MT5)?",
    a: "Ya, VPS Windows kami mendukung instalasi MetaTrader 4 dan MetaTrader 5 beserta Expert Advisor (EA). Paket M ke atas direkomendasikan untuk EA.",
  },
  {
    q: "Berapa lama proses aktivasi VPS Windows?",
    a: "VPS aktif dalam 5–10 menit setelah pembayaran dikonfirmasi. Kredensial RDP dikirim ke email Anda.",
  },
  {
    q: "Kenapa VPS Windows lebih mahal dari Linux?",
    a: "VPS Windows mencakup biaya lisensi Windows Server dan membutuhkan resource minimum lebih besar untuk menjalankan sistem operasi grafis.",
  },
  {
    q: "Apakah tersedia IP Public Static?",
    a: `IP Public Static tersedia sebagai add-on seharga Rp ${IP_STATIC_PRICE}/bulan. Pilih opsi ini saat melakukan order.`,
  },
];

function PlanCard({ plan }: { plan: typeof windowsPlans[0] & { popular?: boolean } }) {
  return (
    <Card className={cn(plan.popular ? "border-primary shadow-lg" : "", "overflow-hidden flex flex-col")}>
      {plan.popular && (
        <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5 tracking-wide">
          ★ Paling Populer
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">Rp {plan.price}</span>
          <span className="text-sm">/bulan</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col flex-1">
        <div className="space-y-2 text-sm flex-1">
          {[
            ["CPU", plan.cpu],
            ["RAM", plan.ram],
            ["Storage", plan.storage],
            ["Bandwidth", plan.bandwidth],
            ["OS", "Windows Server 2022"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right text-xs">{v}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Add-on:</span> IP Public Static
          <span className="ml-1 text-primary font-medium">+Rp {IP_STATIC_PRICE}/bln</span>
        </div>

        <Link
          href={`/order?plan=${plan.id}&type=windows`}
          className={cn(buttonVariants({ variant: plan.popular ? "default" : "outline" }), "w-full mt-auto")}
        >
          Order Sekarang
        </Link>
      </CardContent>
    </Card>
  );
}

export default function VpsWindowsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-500/5 via-background to-background py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Cloud VPS Windows Indonesia</Badge>
            <h1 className="text-4xl font-bold md:text-5xl leading-tight">
              VPS Windows Server 2022<br />
              <span className="text-primary">Mulai Rp 149.000/bulan</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              RDP access penuh, lisensi Windows termasuk, SSD NVMe, dan DDoS protection gratis.
              Ideal untuk MetaTrader, remote desktop, game server, dan aplikasi bisnis.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#paket" className={buttonVariants({ size: "lg" })}>
                Lihat Paket <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/vps" className={buttonVariants({ size: "lg", variant: "outline" })}>
                ← VPS Linux
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["Aktivasi 10 menit", "Lisensi Windows included", "Garansi 7 hari", "Support 24/7"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="paket" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Pilih Paket VPS Windows</h2>
            <p className="mt-2 text-muted-foreground">Lisensi Windows Server 2022 sudah termasuk di semua paket</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {windowsPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Fitur Unggulan</h2>
            <p className="mt-2 text-muted-foreground">Infrastruktur enterprise, harga terjangkau</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Cocok untuk Apa Saja</h2>
            <p className="mt-2 text-muted-foreground">VPS Windows fleksibel untuk berbagai kebutuhan bisnis</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc) => (
              <div key={uc.title} className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{uc.icon}</span>
                  <h3 className="font-semibold">{uc.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {uc.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-background border border-border p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-6">Semua Paket Sudah Termasuk</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-muted/30 p-5">
                <p className="font-semibold text-sm flex items-start gap-2">
                  <ChevronDown className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {faq.q}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Siap Memulai?</h2>
          <p className="mt-2 mb-6 text-primary-foreground/80">Order sekarang dan VPS Windows Anda aktif dalam 10 menit.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#paket" className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}>
              Order VPS Windows
            </Link>
            <Link href="/vps" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10")}>
              Bandingkan dengan Linux
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
