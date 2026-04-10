import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Cpu, HardDrive, Globe, Shield, Zap, Terminal, RefreshCw, HeadphonesIcon, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cloud VPS Linux Indonesia — Harga Mulai Rp 49.000",
  description: "VPS Linux dengan SSD NVMe, Ubuntu/Debian/CentOS, proteksi DDoS, dan full root access. Provisioning otomatis dalam 5 menit.",
};

const IP_STATIC_PRICE = "100.000";

const linuxPlans = [
  { id: "vps-l-s",  name: "VPS Linux S",  price: "49.000",  cpu: "1 vCPU",  ram: "1 GB",   storage: "25 GB NVMe",  bandwidth: "1 TB" },
  { id: "vps-l-m",  name: "VPS Linux M",  price: "99.000",  cpu: "2 vCPU",  ram: "4 GB",   storage: "80 GB NVMe",  bandwidth: "3 TB",  popular: true },
  { id: "vps-l-l",  name: "VPS Linux L",  price: "199.000", cpu: "4 vCPU",  ram: "8 GB",   storage: "160 GB NVMe", bandwidth: "5 TB" },
  { id: "vps-l-xl", name: "VPS Linux XL", price: "349.000", cpu: "8 vCPU",  ram: "16 GB",  storage: "320 GB NVMe", bandwidth: "8 TB" },
];

const features = [
  { icon: Zap,             title: "SSD NVMe Gen 4",         desc: "Kecepatan baca/tulis 7.000 MB/s — 10× lebih cepat dari SSD biasa." },
  { icon: Shield,          title: "DDoS Protection Gratis",  desc: "Mitigasi serangan otomatis hingga 1 Tbps tanpa biaya tambahan." },
  { icon: Terminal,        title: "Full Root Access",        desc: "Kontrol penuh via SSH. Install apa saja, konfigurasi sesuai kebutuhan." },
  { icon: Cpu,             title: "AMD EPYC Processor",      desc: "Prosesor server terbaru dengan performa tinggi dan efisiensi daya." },
  { icon: RefreshCw,       title: "Reinstall OS Kapan Saja", desc: "Ganti distro Linux dalam hitungan menit via panel Virtualizor." },
  { icon: Globe,           title: "Datacenter Jakarta",      desc: "Latensi rendah ke seluruh Indonesia dengan koneksi IX Indonesia." },
  { icon: HardDrive,       title: "Snapshot & Backup",       desc: "Proteksi data dengan snapshot manual dan jadwal backup otomatis." },
  { icon: HeadphonesIcon,  title: "Support 24/7",            desc: "Tim ahli siap membantu via tiket dan WhatsApp kapan saja." },
];

const useCases = [
  {
    title: "Web Hosting & CMS",
    icon: "🌐",
    desc: "Jalankan WordPress, Laravel, Next.js, atau aplikasi web lainnya dengan performa optimal.",
    tags: ["WordPress", "Laravel", "Next.js", "Nginx"],
  },
  {
    title: "Database Server",
    icon: "🗄️",
    desc: "MySQL, PostgreSQL, MongoDB, atau Redis dengan storage NVMe ultra-cepat.",
    tags: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    title: "Bot & Automation",
    icon: "🤖",
    desc: "Jalankan bot Telegram, scraper, atau task automation 24/7 tanpa gangguan.",
    tags: ["Python Bot", "Cron Job", "API Server"],
  },
  {
    title: "Game Server",
    icon: "🎮",
    desc: "Hosting Minecraft, CS:GO, atau game server lain dengan latensi rendah ke pemain Indonesia.",
    tags: ["Minecraft", "CS:GO", "MTA:SA"],
  },
  {
    title: "CI/CD & DevOps",
    icon: "⚙️",
    desc: "Self-host GitLab, Jenkins, atau Docker registry untuk pipeline deployment Anda.",
    tags: ["Docker", "GitLab CI", "Jenkins"],
  },
  {
    title: "VPN & Proxy",
    icon: "🔒",
    desc: "Setup WireGuard, OpenVPN, atau Squid Proxy dengan full root dan IP dedicated.",
    tags: ["WireGuard", "OpenVPN", "Squid"],
  },
];

const included = [
  "Full root access via SSH",
  "Panel Virtualizor",
  "Proteksi DDoS gratis",
  "Snapshot manual",
  "IPv4 dedicated",
  "Uptime SLA 99.9%",
  "Support 24/7",
  "Reinstall OS kapan saja",
  "Bandwidth unmetered*",
  "rDNS / PTR record",
];

const distros = [
  { name: "Ubuntu 22.04 / 24.04", icon: "🟠" },
  { name: "Debian 11 / 12", icon: "🔴" },
  { name: "AlmaLinux 9", icon: "🔵" },
  { name: "Rocky Linux 9", icon: "🟢" },
  { name: "Fedora 39", icon: "🔵" },
  { name: "CentOS Stream 9", icon: "⚪" },
];

const faqs = [
  {
    q: "Berapa lama proses aktivasi VPS Linux?",
    a: "VPS aktif secara otomatis dalam 2–5 menit setelah pembayaran dikonfirmasi. Kredensial akses dikirim ke email Anda.",
  },
  {
    q: "Apakah bisa upgrade paket di kemudian hari?",
    a: "Ya, Anda bisa upgrade ke paket yang lebih besar kapan saja. Proses upgrade biasanya membutuhkan reboot singkat.",
  },
  {
    q: "Distro Linux apa saja yang tersedia?",
    a: "Tersedia Ubuntu, Debian, AlmaLinux, Rocky Linux, Fedora, dan CentOS Stream. Anda juga bisa request distro lain via support.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Ya, kami memberikan garansi uang kembali 7 hari jika Anda tidak puas dengan layanan kami.",
  },
  {
    q: "Berapa harga IP Public Static?",
    a: `IP Public Static tersedia sebagai add-on seharga Rp ${IP_STATIC_PRICE}/bulan. Pilih opsi ini saat melakukan order.`,
  },
];

function PlanCard({ plan }: { plan: typeof linuxPlans[0] & { popular?: boolean } }) {
  return (
    <Card className={cn(
      "overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5",
      plan.popular
        ? "border-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
        : "hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30"
    )}>
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
            ["OS", "Ubuntu / Debian / dll"],
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
          href={`/order?plan=${plan.id}&type=linux`}
          className={cn(buttonVariants({ variant: plan.popular ? "default" : "outline" }), "w-full mt-auto")}
        >
          Order Sekarang
        </Link>
      </CardContent>
    </Card>
  );
}

export default function VpsLinuxPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Cloud VPS Linux Indonesia</Badge>
            <h1 className="text-4xl font-bold md:text-5xl leading-tight">
              VPS Linux Performa Tinggi<br />
              <span className="text-primary">Mulai Rp 49.000/bulan</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              SSD NVMe, proteksi DDoS gratis, full root access, dan provisioning otomatis dalam 5 menit.
              Cocok untuk web hosting, bot, game server, dan lebih banyak lagi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#paket" className={buttonVariants({ size: "lg" })}>
                Lihat Paket <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/vps/windows" className={buttonVariants({ size: "lg", variant: "outline" })}>
                VPS Windows →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["Aktivasi 5 menit", "Garansi 7 hari", "Uptime 99.9% SLA", "Support 24/7"].map((t) => (
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
            <h2 className="text-3xl font-bold">Pilih Paket VPS Linux</h2>
            <p className="mt-2 text-muted-foreground">Semua paket sudah termasuk IP dedicated, DDoS protection, dan panel Virtualizor</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {linuxPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            * Bandwidth fair-use. Butuh resource lebih besar?{" "}
            <Link href="/dedicated" className="text-primary hover:underline">Lihat Dedicated Server</Link>
          </p>
        </div>
      </section>

      {/* OS Distros */}
      <section className="bg-muted/30 py-14 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Sistem Operasi Tersedia</h2>
            <p className="mt-2 text-muted-foreground text-sm">Pilih distro favorit Anda — bisa reinstall kapan saja</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
            {distros.map((d) => (
              <div key={d.name} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center">
                <span className="text-3xl">{d.icon}</span>
                <span className="text-xs font-medium leading-tight">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Fitur Unggulan</h2>
            <p className="mt-2 text-muted-foreground">Infrastruktur enterprise, harga terjangkau</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3 rounded-xl border border-border p-5">
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
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Cocok untuk Apa Saja</h2>
            <p className="mt-2 text-muted-foreground">VPS Linux fleksibel untuk berbagai kebutuhan</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc) => (
              <div key={uc.title} className="rounded-xl border border-border bg-background p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{uc.icon}</span>
                  <h3 className="font-semibold">{uc.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {uc.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium">
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-muted/30 border border-border p-8 md:p-10">
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
      <section className="bg-muted/30 py-16 border-t border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-background p-5">
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
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Butuh VPS Windows?</h2>
          <p className="mt-2 text-muted-foreground mb-6">Tersedia juga paket VPS Windows Server dengan RDP akses.</p>
          <Link href="/vps/windows" className={buttonVariants({ variant: "outline" })}>
            Lihat VPS Windows <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
