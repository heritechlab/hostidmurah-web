import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Globe,
  ShoppingCart,
  Layers,
  Cpu,
  Star,
  ArrowRight,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Profesional | HostIDMurah",
  description:
    "Jasa pembuatan website profesional: landing page, company profile, toko online, dan aplikasi web custom. Harga terjangkau, kualitas premium.",
};

const WA_NUMBER = "6285212348518";

const packages = [
  {
    name: "Landing Page",
    icon: Globe,
    price: 500000,
    duration: "3–5 hari kerja",
    description: "Halaman tunggal promosi produk atau layanan, modern dan responsif.",
    features: [
      "1 halaman (one-page)",
      "Desain responsif (mobile-friendly)",
      "Formulir kontak / WhatsApp CTA",
      "SEO dasar (meta title & description)",
      "SSL gratis (jika hosting di HostIDMurah)",
      "Revisi hingga 3x",
    ],
    popular: false,
    color: "bg-blue-50 dark:bg-blue-950/30",
    badgeColor: "",
  },
  {
    name: "Company Profile",
    icon: Layers,
    price: 1500000,
    duration: "5–10 hari kerja",
    description: "Website multi-halaman profesional untuk membangun kepercayaan bisnis.",
    features: [
      "5–8 halaman (Home, About, Service, Portfolio, Contact)",
      "Desain responsif & modern",
      "Formulir kontak + Google Maps",
      "Blog / artikel (opsional)",
      "SEO on-page lengkap",
      "Integrasi WhatsApp Chat",
      "Revisi hingga 5x",
    ],
    popular: true,
    color: "bg-primary/5 dark:bg-primary/10",
    badgeColor: "bg-primary text-primary-foreground",
  },
  {
    name: "Toko Online",
    icon: ShoppingCart,
    price: 3000000,
    duration: "10–15 hari kerja",
    description: "Toko online lengkap dengan manajemen produk dan payment gateway.",
    features: [
      "Katalog produk tak terbatas",
      "Keranjang belanja & checkout",
      "Integrasi payment gateway (Midtrans/Xendit)",
      "Dashboard admin produk & pesanan",
      "Manajemen stok & kategori",
      "Laporan penjualan dasar",
      "Revisi hingga 5x",
    ],
    popular: false,
    color: "bg-green-50 dark:bg-green-950/30",
    badgeColor: "",
  },
  {
    name: "Aplikasi Web Custom",
    icon: Cpu,
    price: 0,
    duration: "Sesuai kebutuhan",
    description: "Sistem web sesuai kebutuhan spesifik bisnis Anda: CRM, ERP, SaaS, dll.",
    features: [
      "Analisa kebutuhan & wireframe",
      "Desain UI/UX custom",
      "Backend API (FastAPI / Node.js)",
      "Database design (PostgreSQL / MySQL)",
      "Panel admin / dashboard",
      "Dokumentasi teknis",
      "Maintenance support 1 bulan",
    ],
    popular: false,
    color: "bg-purple-50 dark:bg-purple-950/30",
    badgeColor: "",
  },
];

const portfolio = [
  {
    name: "TokoSegar.id",
    category: "Toko Online",
    description: "Toko online sayuran organik dengan manajemen produk, pesanan, dan integrasi payment gateway.",
    tech: ["Next.js", "FastAPI", "PostgreSQL"],
  },
  {
    name: "CV Maju Jaya",
    category: "Company Profile",
    description: "Website company profile perusahaan kontraktor dengan portofolio proyek dan formulir penawaran.",
    tech: ["Next.js", "Tailwind CSS"],
  },
  {
    name: "KlinikSehat App",
    category: "Aplikasi Web Custom",
    description: "Sistem manajemen klinik: antrian pasien, rekam medis, dan laporan dokter.",
    tech: ["React", "Node.js", "MySQL"],
  },
  {
    name: "PropertyIn",
    category: "Landing Page",
    description: "Landing page agen properti dengan listing, pencarian, dan WhatsApp CTA.",
    tech: ["Next.js", "Tailwind CSS"],
  },
  {
    name: "LPK Nusantara",
    category: "Company Profile",
    description: "Website lembaga pendidikan dengan profil kursus, galeri, dan pendaftaran online.",
    tech: ["Next.js", "CMS Headless"],
  },
  {
    name: "WarungKu POS",
    category: "Aplikasi Web Custom",
    description: "Aplikasi point-of-sale berbasis web untuk warung makan dengan laporan harian.",
    tech: ["React", "FastAPI", "PostgreSQL"],
  },
];

const process = [
  { step: "1", title: "Konsultasi", desc: "Diskusi kebutuhan, fitur, dan target website Anda via WhatsApp." },
  { step: "2", title: "Penawaran", desc: "Kami kirimkan proposal harga dan timeline pengerjaan." },
  { step: "3", title: "Pengerjaan", desc: "Tim kami mulai desain dan pengembangan sesuai brief." },
  { step: "4", title: "Review & Revisi", desc: "Anda review hasilnya, kami revisi sesuai feedback." },
  { step: "5", title: "Selesai", desc: "Website diluncurkan, kami berikan panduan penggunaan." },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function JasaWebsitePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Jasa Pembuatan Website
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Website Profesional,{" "}
            <span className="text-primary">Harga Terjangkau</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Kami bantu wujudkan website impian Anda — dari landing page sederhana hingga
            aplikasi web kompleks. Dikerjakan oleh tim berpengalaman, tepat waktu, dan
            sesuai budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waLink("Halo, saya ingin konsultasi jasa pembuatan website.")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi Gratis via WA
            </a>
            <a
              href="#paket"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              Lihat Paket <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "50+", label: "Proyek Selesai" },
              { value: "98%", label: "Klien Puas" },
              { value: "3 Hari", label: "Rata-rata Delivery" },
              { value: "24/7", label: "Support After Launch" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="paket" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Paket Layanan</h2>
            <p className="mt-2 text-muted-foreground">
              Pilih paket yang sesuai kebutuhan bisnis Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={pkg.name}
                  className={cn(
                    "relative rounded-xl border border-border p-6 flex flex-col transition-all hover:-translate-y-1.5 hover:shadow-lg",
                    pkg.color,
                    pkg.popular && "border-primary shadow-md"
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        Paling Populer
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                  </div>

                  <div className="mb-4">
                    {pkg.price > 0 ? (
                      <>
                        <p className="text-xs text-muted-foreground">Mulai dari</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(pkg.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-primary">Custom</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.duration}</p>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={waLink(`Halo, saya tertarik dengan paket ${pkg.name}. Boleh info lebih lanjut?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: pkg.popular ? "default" : "outline", size: "sm" }),
                      "w-full gap-1.5"
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Pesan Sekarang
                  </a>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Harga belum termasuk domain dan hosting. Dapatkan diskon bundling jika hosting di HostIDMurah.{" "}
            <a
              href={waLink("Halo, saya ingin tanya soal bundling jasa website + hosting.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Tanya promo bundling →
            </a>
          </p>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Portofolio</h2>
            <p className="mt-2 text-muted-foreground">
              Sebagian proyek yang telah kami selesaikan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-border bg-background p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Alur Pengerjaan</h2>
            <p className="mt-2 text-muted-foreground">
              Proses transparan dari konsultasi hingga website live
            </p>
          </div>

          <div className="relative">
            {/* connector line desktop */}
            <div className="hidden sm:block absolute top-5 left-[calc(10%-1px)] right-[calc(10%-1px)] h-px bg-border z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
              {process.map((p) => (
                <div key={p.step} className="flex flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3 shrink-0">
                    {p.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-3">Siap Buat Website Anda?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Konsultasi gratis via WhatsApp. Kami siap bantu Anda dari nol hingga website live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waLink("Halo, saya ingin konsultasi pembuatan website.")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "gap-2"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp Sekarang
            </a>
            <a
              href="tel:+6285212348518"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-white/10 hover:bg-white/20 border border-white/20"
              )}
            >
              <Phone className="h-4 w-4" />
              +62 852-1234-8518
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
