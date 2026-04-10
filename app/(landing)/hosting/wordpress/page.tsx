import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Shield, RefreshCw, Headphones, Globe, BarChart3, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "WordPress Hosting | HostIDMurah",
  description: "Hosting WordPress dioptimalkan dengan cache otomatis, auto-update, SSL gratis, dan staging environment. Website WordPress Anda lebih cepat dan aman.",
};

const plans = [
  {
    name: "WP Starter",
    price: 29000,
    storage: "5 GB SSD",
    sites: 1,
    visits: "10.000/bln",
    staging: false,
    popular: false,
  },
  {
    name: "WP Business",
    price: 59000,
    storage: "15 GB SSD",
    sites: 3,
    visits: "50.000/bln",
    staging: true,
    popular: true,
  },
  {
    name: "WP Pro",
    price: 99000,
    storage: "30 GB SSD",
    sites: "Unlimited",
    visits: "200.000/bln",
    staging: true,
    popular: false,
  },
];

const features = [
  { icon: Zap, title: "Cache Otomatis (LiteSpeed)", desc: "Website WordPress Anda dimuat ultra-cepat dengan cache LiteSpeed bawaan." },
  { icon: RefreshCw, title: "Auto Update WordPress", desc: "Core, tema, dan plugin diperbarui otomatis untuk keamanan maksimal." },
  { icon: Shield, title: "Malware Scanner", desc: "Pemindaian malware harian dan pembersihan otomatis jika terdeteksi." },
  { icon: Globe, title: "SSL Gratis", desc: "HTTPS aktif otomatis di semua domain dan subdomain." },
  { icon: BarChart3, title: "Staging Environment", desc: "Uji perubahan di staging sebelum diterapkan ke production (paket Business+)." },
  { icon: Headphones, title: "Support WordPress", desc: "Tim support berpengalaman siap membantu masalah WordPress Anda." },
];

export default function WordPressHostingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            WordPress Hosting
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Hosting Dioptimalkan untuk WordPress
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Lebih cepat, lebih aman, lebih mudah. Server khusus WordPress dengan cache LiteSpeed,
            auto-update, dan staging environment mulai Rp 29.000/bulan.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <a href="#plans" className={cn(buttonVariants({ size: "lg" }))}>
              Lihat Paket
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20ingin%20tanya%20tentang%20WordPress%20Hosting`}
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
          <h2 className="text-2xl font-bold text-center mb-10">Paket WordPress Hosting</h2>
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
                    { label: "Storage SSD", value: plan.storage },
                    { label: "Website", value: `${plan.sites} site` },
                    { label: "Kunjungan", value: plan.visits },
                    { label: "SSL Gratis", value: "check" },
                    { label: "Cache LiteSpeed", value: "check" },
                    { label: "Auto Update", value: "check" },
                    { label: "Staging", value: plan.staging ? "check" : "-" },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium flex items-center gap-1">
                        {value === "check" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : value === "-" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          value
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/order?type=hosting-wordpress&plan=${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
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
          <h2 className="text-2xl font-bold text-center mb-10">Kenapa Pilih WordPress Hosting Kami?</h2>
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
          <h2 className="text-2xl font-bold">Siap migrasi WordPress Anda?</h2>
          <p className="mt-2 text-muted-foreground">Kami bantu migrasi website WordPress lama Anda ke hosting kami secara gratis.</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20ingin%20migrasi%20WordPress%20ke%20HostIDMurah`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex items-center gap-2")}
          >
            Chat WhatsApp — Migrasi Gratis
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
