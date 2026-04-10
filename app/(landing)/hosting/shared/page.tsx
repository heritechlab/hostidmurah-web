import type { Metadata } from "next";
import Link from "next/link";
import { Check, Globe, Zap, Shield, HardDrive, Headphones, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shared Hosting cPanel | HostIDMurah",
  description: "Shared hosting murah dengan cPanel, SSL gratis, dan bandwidth unlimited. Cocok untuk website bisnis, blog, dan toko online.",
};

const plans = [
  {
    name: "Starter",
    price: 19000,
    storage: "2 GB SSD",
    bandwidth: "Unlimited",
    domains: 1,
    email: 5,
    databases: 3,
    popular: false,
  },
  {
    name: "Business",
    price: 39000,
    storage: "5 GB SSD",
    bandwidth: "Unlimited",
    domains: 3,
    email: 20,
    databases: 10,
    popular: true,
  },
  {
    name: "Pro",
    price: 69000,
    storage: "15 GB SSD",
    bandwidth: "Unlimited",
    domains: 10,
    email: "Unlimited",
    databases: "Unlimited",
    popular: false,
  },
];

const features = [
  { icon: Globe, title: "cPanel Terbaru", desc: "Panel kontrol terpopuler, mudah digunakan bahkan oleh pemula." },
  { icon: Shield, title: "SSL Gratis (Let's Encrypt)", desc: "Aktifkan HTTPS di semua domain tanpa biaya tambahan." },
  { icon: Zap, title: "SSD NVMe", desc: "Storage SSD untuk loading website lebih cepat." },
  { icon: HardDrive, title: "Auto Backup Harian", desc: "Backup otomatis setiap hari, bisa restore kapan saja." },
  { icon: Headphones, title: "Support 24/7", desc: "Tim support siap membantu via tiket dan WhatsApp." },
  { icon: Globe, title: "Uptime 99.9% SLA", desc: "Datacenter Indonesia dengan jaminan uptime tinggi." },
];

export default function SharedHostingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Shared Hosting
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Hosting Website Murah & Andal
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Mulai dari Rp 19.000/bulan. cPanel, SSL gratis, bandwidth unlimited, dan support 24/7.
            Cocok untuk website bisnis, portofolio, dan blog.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <a href="#plans" className={cn(buttonVariants({ size: "lg" }))}>
              Lihat Paket
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20ingin%20tanya%20tentang%20Shared%20Hosting`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Pilih Paket Hosting</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-xl border bg-card flex flex-col overflow-hidden",
                  "transition-all duration-300 ease-out hover:-translate-y-1.5",
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                    : "border-border hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30"
                )}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5 tracking-wide">
                    ★ Terpopuler
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      Rp {plan.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm text-muted-foreground">/bulan</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {[
                    { label: "Storage", value: plan.storage },
                    { label: "Bandwidth", value: plan.bandwidth },
                    { label: "Domain", value: `${plan.domains} domain` },
                    { label: "Akun Email", value: `${plan.email} akun` },
                    { label: "Database MySQL", value: `${plan.databases} DB` },
                    { label: "SSL Gratis", value: "Included" },
                    { label: "cPanel", value: "Included" },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium flex items-center gap-1">
                        {value === "Included" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          value
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/order?type=hosting-shared&plan=${plan.name.toLowerCase()}`}
                  className={cn(
                    buttonVariants({ variant: plan.popular ? "default" : "outline" }),
                    "w-full"
                  )}
                >
                  Pesan Sekarang
                </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Semua Paket Sudah Termasuk</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Butuh rekomendasi paket?</h2>
          <p className="mt-2 text-muted-foreground">Tim kami siap membantu memilih paket yang paling sesuai kebutuhan Anda.</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20butuh%20rekomendasi%20paket%20hosting`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex items-center gap-2")}
          >
            Chat WhatsApp Sekarang
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
