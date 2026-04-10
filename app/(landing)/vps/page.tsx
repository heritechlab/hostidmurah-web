import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cloud VPS Indonesia",
  description: "Paket Cloud VPS Linux dan Windows dengan harga terjangkau. SSD NVMe, proteksi DDoS, dan support 24/7.",
};

const IP_STATIC_PRICE = "50.000";

const linuxPlans = [
  { name: "VPS Linux S", price: "49.000", cpu: "1 vCPU", ram: "1 GB", storage: "25 GB NVMe", bandwidth: "1 TB", os: "Ubuntu/Debian/CentOS" },
  { name: "VPS Linux M", price: "99.000", cpu: "2 vCPU", ram: "4 GB", storage: "80 GB NVMe", bandwidth: "3 TB", os: "Ubuntu/Debian/CentOS", popular: true },
  { name: "VPS Linux L", price: "199.000", cpu: "4 vCPU", ram: "8 GB", storage: "160 GB NVMe", bandwidth: "5 TB", os: "Ubuntu/Debian/CentOS" },
  { name: "VPS Linux XL", price: "349.000", cpu: "8 vCPU", ram: "16 GB", storage: "320 GB NVMe", bandwidth: "8 TB", os: "Ubuntu/Debian/CentOS" },
];

const windowsPlans = [
  { name: "VPS Windows S", price: "149.000", cpu: "2 vCPU", ram: "4 GB", storage: "80 GB NVMe", bandwidth: "2 TB", os: "Windows Server 2022" },
  { name: "VPS Windows M", price: "249.000", cpu: "4 vCPU", ram: "8 GB", storage: "160 GB NVMe", bandwidth: "4 TB", os: "Windows Server 2022", popular: true },
  { name: "VPS Windows L", price: "449.000", cpu: "8 vCPU", ram: "16 GB", storage: "320 GB NVMe", bandwidth: "6 TB", os: "Windows Server 2022" },
];

const included = [
  "Full root / administrator access",
  "Panel kontrol Virtualizor",
  "Proteksi DDoS gratis",
  "Snapshot & backup tersedia",
  "IPv4 dedicated",
  "Uptime SLA 99.9%",
  "Support 24/7 via tiket",
  "Reinstall OS kapan saja",
];

function PlanCard({ plan }: { plan: typeof linuxPlans[0] & { popular?: boolean } }) {
  return (
    <Card className={plan.popular ? "relative border-primary shadow-lg" : "relative"}>
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="px-4 shadow-sm">Paling Populer</Badge>
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">Rp {plan.price}</span>
          <span className="text-sm">/bulan</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CPU</span>
            <span className="font-medium">{plan.cpu}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">RAM</span>
            <span className="font-medium">{plan.ram}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium">{plan.storage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bandwidth</span>
            <span className="font-medium">{plan.bandwidth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">OS</span>
            <span className="font-medium text-right text-xs">{plan.os}</span>
          </div>
        </div>

        {/* IP Public Static add-on */}
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Add-on:</span> IP Public Static
          <span className="ml-1 text-primary font-medium">+Rp {IP_STATIC_PRICE}/bln</span>
          <span className="ml-1">(pilih saat order)</span>
        </div>

        <Link
          href="/order"
          className={cn(buttonVariants({ variant: plan.popular ? "default" : "outline" }), "w-full")}
        >
          Order Sekarang
        </Link>
      </CardContent>
    </Card>
  );
}

export default function VpsPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Cloud VPS Indonesia</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Paket Cloud VPS</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Performa tinggi dengan SSD NVMe, provisioning instan, dan full kontrol atas server Anda.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="inline-block h-4 w-1 bg-primary rounded" />
            Cloud VPS Linux
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-5">
            {linuxPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="inline-block h-4 w-1 bg-primary rounded" />
            Cloud VPS Windows
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-5">
            {windowsPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </div>

        <div className="bg-muted/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Semua Paket Sudah Termasuk</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Butuh resource lebih besar? Coba Dedicated Server kami.</p>
          <Link href="/dedicated" className={buttonVariants({ variant: "outline" })}>
            Lihat Dedicated Server <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
