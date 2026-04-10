import Link from "next/link";
import { ArrowRight, Server, Shield, Zap, Clock, Headphones, Globe, Star, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "10.000+", label: "Pelanggan Aktif" },
  { value: "24/7", label: "Support Siap" },
  { value: "5+", label: "Tahun Beroperasi" },
];

const features = [
  { icon: Zap, title: "Performa Tinggi", description: "SSD NVMe Gen 4, prosesor AMD EPYC terbaru, dan jaringan 10 Gbps." },
  { icon: Shield, title: "Proteksi DDoS", description: "Mitigasi serangan DDoS otomatis hingga 1 Tbps tanpa biaya tambahan." },
  { icon: Globe, title: "Lokasi Indonesia", description: "Data center tier-3 di Jakarta dengan latensi rendah." },
  { icon: Headphones, title: "Support 24/7", description: "Tim ahli kami siap membantu via tiket, live chat, dan WhatsApp." },
  { icon: Clock, title: "Provisioning Cepat", description: "VPS aktif dalam hitungan menit setelah pembayaran dikonfirmasi." },
  { icon: Server, title: "Full Root Access", description: "Kontrol penuh atas server Anda dengan akses root / administrator." },
];

const plans = [
  { name: "VPS Starter", price: "49.000", specs: ["1 vCPU", "1 GB RAM", "25 GB SSD NVMe", "1 TB Bandwidth"], popular: false },
  { name: "VPS Business", price: "99.000", specs: ["2 vCPU", "4 GB RAM", "80 GB SSD NVMe", "3 TB Bandwidth"], popular: true },
  { name: "VPS Professional", price: "199.000", specs: ["4 vCPU", "8 GB RAM", "160 GB SSD NVMe", "5 TB Bandwidth"], popular: false },
];

const testimonials = [
  { name: "Ahmad Fauzi", role: "Developer Freelance", content: "HostIDMurah sudah saya pakai 2 tahun. Uptime selalu bagus dan support responsif!", rating: 5 },
  { name: "Siti Rahayu", role: "Owner Toko Online", content: "Server cepat dan stabil. Website toko tidak pernah down selama pakai HostIDMurah!", rating: 5 },
  { name: "Budi Santoso", role: "IT Manager", content: "Solusi VPS paling cost-effective. Performa setara provider luar dengan harga Indonesia.", rating: 5 },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6 text-sm">
              Promo Spesial - Diskon 30% untuk 3 bulan pertama
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Hosting VPS Indonesia
              <span className="text-primary"> Terpercaya dan Terjangkau</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              VPS Linux dan Windows, Dedicated Server, dan layanan cloud berkualitas tinggi. Mulai dari Rp 49.000/bulan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pricing" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
                Lihat Paket Harga <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/vps" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}>
                Explore VPS
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Paket VPS Terpopuler</h2>
              <p className="mt-4 text-muted-foreground">Pilih paket yang sesuai dengan kebutuhan Anda</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 pt-5">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.popular ? "relative transition-shadow hover:shadow-lg border-primary shadow-md" : "relative transition-shadow hover:shadow-lg"}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="px-4">Paling Populer</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">Rp {plan.price}</span>
                      <span className="text-sm">/bulan</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.specs.map((spec) => (
                        <li key={spec} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/order"
                      className={cn(buttonVariants({ variant: plan.popular ? "default" : "outline" }), "w-full")}
                    >
                      Order Sekarang
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/pricing" className={buttonVariants({ variant: "link" })}>
                Lihat semua paket dan harga <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Mengapa Pilih HostIDMurah?</h2>
              <p className="mt-4 text-muted-foreground">Infrastruktur enterprise dengan harga terjangkau</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background">
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Dipercaya Ribuan Pelanggan</h2>
              <p className="mt-4 text-muted-foreground">Apa kata mereka tentang HostIDMurah</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="bg-muted/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.content}</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Mulai Sekarang, Tanpa Risiko</h2>
            <p className="mt-4 mb-8 text-primary-foreground/80 max-w-xl mx-auto">
              Daftar dan dapatkan VPS Anda dalam hitungan menit. Garansi uang kembali 7 hari jika tidak puas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}>
                Daftar Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10")}>
                Hubungi Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
