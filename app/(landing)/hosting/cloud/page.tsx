import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Server, Shield, BarChart3, Globe, Headphones, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cloud Hosting | HostIDMurah",
  description: "Cloud hosting scalable dengan resource dedicated, auto-scaling, dan uptime 99.9%. Lebih bertenaga dari shared hosting, lebih terjangkau dari VPS.",
};

const plans = [
  {
    name: "Cloud Lite",
    price: 49000,
    cpu: "1 vCPU",
    ram: "1 GB",
    storage: "20 GB SSD",
    bandwidth: "2 TB",
    sites: "Unlimited",
    popular: false,
  },
  {
    name: "Cloud Business",
    price: 99000,
    cpu: "2 vCPU",
    ram: "2 GB",
    storage: "40 GB SSD",
    bandwidth: "4 TB",
    sites: "Unlimited",
    popular: true,
  },
  {
    name: "Cloud Pro",
    price: 179000,
    cpu: "4 vCPU",
    ram: "4 GB",
    storage: "80 GB SSD",
    bandwidth: "8 TB",
    sites: "Unlimited",
    popular: false,
  },
];

const features = [
  { icon: Server, title: "Resource Dedicated", desc: "CPU dan RAM dedicated — tidak berbagi dengan pengguna lain, performa konsisten." },
  { icon: Zap, title: "Auto-Scaling Bandwidth", desc: "Traffic spike? Bandwidth otomatis menyesuaikan tanpa downtime." },
  { icon: Shield, title: "Proteksi DDoS", desc: "Proteksi DDoS layer 3, 4, dan 7 aktif di semua paket tanpa biaya tambahan." },
  { icon: Globe, title: "CDN + SSL Gratis", desc: "CDN global dan SSL Let's Encrypt aktif otomatis untuk semua domain." },
  { icon: BarChart3, title: "Dashboard Monitoring", desc: "Pantau penggunaan CPU, RAM, bandwidth, dan disk secara real-time." },
  { icon: Headphones, title: "Support Prioritas", desc: "Tiket support dengan prioritas lebih tinggi dibanding shared hosting." },
];

export default function CloudHostingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Cloud Hosting
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Cloud Hosting — Antara Shared & VPS
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Resource dedicated seperti VPS, kemudahan seperti shared hosting.
            Mulai dari Rp 49.000/bulan dengan CPU, RAM, dan storage yang tidak berbagi.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <a href="#plans" className={cn(buttonVariants({ size: "lg" }))}>
              Lihat Paket
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20ingin%20tanya%20tentang%20Cloud%20Hosting`}
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
          <h2 className="text-2xl font-bold text-center mb-10">Paket Cloud Hosting</h2>
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
                    { label: "CPU", value: plan.cpu },
                    { label: "RAM", value: plan.ram },
                    { label: "Storage SSD", value: plan.storage },
                    { label: "Bandwidth", value: plan.bandwidth },
                    { label: "Website", value: plan.sites },
                    { label: "SSL + CDN Gratis", value: "check" },
                    { label: "Proteksi DDoS", value: "check" },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium flex items-center gap-1">
                        {value === "check" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          value
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/order?type=hosting-cloud&plan=${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
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
          <h2 className="text-2xl font-bold text-center mb-10">Keunggulan Cloud Hosting</h2>
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
          <h2 className="text-2xl font-bold">Tidak yakin mana yang cocok?</h2>
          <p className="mt-2 text-muted-foreground">Konsultasikan kebutuhan Anda dengan tim kami — gratis, tanpa komitmen.</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285212348518"}?text=Halo%2C%20saya%20ingin%20konsultasi%20pilihan%20cloud%20hosting`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex items-center gap-2")}
          >
            Konsultasi Gratis via WhatsApp
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
