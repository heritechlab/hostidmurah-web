import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dedicated Server Indonesia",
  description: "Server fisik eksklusif dengan performa maksimal. Cocok untuk aplikasi enterprise, game server, dan bisnis skala besar.",
};

const plans = [
  {
    name: "Dedicated Starter",
    price: "1.500.000",
    cpu: "Intel Xeon E3-1230 v6",
    cores: "4 Core / 8 Thread",
    ram: "16 GB DDR4",
    storage: "2 x 500 GB SSD",
    bandwidth: "Unlimited 100 Mbps",
    popular: false,
  },
  {
    name: "Dedicated Business",
    price: "2.500.000",
    cpu: "Intel Xeon E5-2670 v3",
    cores: "12 Core / 24 Thread",
    ram: "32 GB DDR4",
    storage: "2 x 1 TB SSD NVMe",
    bandwidth: "Unlimited 1 Gbps",
    popular: true,
  },
  {
    name: "Dedicated Enterprise",
    price: "4.500.000",
    cpu: "Dual Intel Xeon Gold 6130",
    cores: "32 Core / 64 Thread",
    ram: "128 GB DDR4",
    storage: "4 x 1 TB SSD NVMe",
    bandwidth: "Unlimited 10 Gbps",
    popular: false,
  },
];

const features = [
  "Fisik server eksklusif, tidak shared",
  "Full IPMI / KVM remote access",
  "Proteksi DDoS enterprise",
  "OS custom sesuai kebutuhan",
  "Colocation di data center Jakarta",
  "Hardware monitoring 24/7",
  "Dedicated IPv4 block",
  "SLA 99.99% uptime",
];

export default function DedicatedPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Dedicated Server</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Dedicated Server Indonesia</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Server fisik eksklusif untuk performa maksimal. Ideal untuk aplikasi enterprise, database besar, dan game server.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5",
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                  : "hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30"
              )}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5 tracking-wide">
                  ★ Paling Populer
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">Rp {plan.price}</span>
                  <span className="text-sm">/bulan</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col flex-1">
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-medium text-right text-xs">{plan.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Core</span>
                    <span className="font-medium">{plan.cores}</span>
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
                    <span className="font-medium text-xs text-right">{plan.bandwidth}</span>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className={cn("w-full text-center", buttonVariants({ variant: plan.popular ? "default" : "outline" }))}
                >
                  Hubungi Sales
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Fitur Unggulan Dedicated Server</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-primary/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Butuh Konfigurasi Custom?</h2>
          <p className="text-muted-foreground mb-6">
            Tim sales kami siap membantu merancang infrastruktur yang tepat untuk bisnis Anda.
          </p>
          <Link href="/contact" className={buttonVariants()}>
            <Phone className="mr-2 h-4 w-4" /> Hubungi Sales Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
