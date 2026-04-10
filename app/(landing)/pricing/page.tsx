import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Harga Layanan",
  description: "Daftar harga lengkap Cloud VPS Linux, VPS Windows, dan Dedicated Server HostIDMurah.",
};

const categories = [
  {
    title: "Cloud VPS Linux",
    badge: "Mulai Rp 49.000/bln",
    plans: [
      { name: "VPS-L-S", price: "49.000", cpu: "1 vCPU", ram: "1 GB", storage: "25 GB NVMe", bandwidth: "1 TB", popular: false },
      { name: "VPS-L-M", price: "99.000", cpu: "2 vCPU", ram: "4 GB", storage: "80 GB NVMe", bandwidth: "3 TB", popular: true },
      { name: "VPS-L-L", price: "199.000", cpu: "4 vCPU", ram: "8 GB", storage: "160 GB NVMe", bandwidth: "5 TB", popular: false },
      { name: "VPS-L-XL", price: "349.000", cpu: "8 vCPU", ram: "16 GB", storage: "320 GB NVMe", bandwidth: "8 TB", popular: false },
      { name: "VPS-L-XXL", price: "649.000", cpu: "16 vCPU", ram: "32 GB", storage: "640 GB NVMe", bandwidth: "10 TB", popular: false },
    ],
  },
  {
    title: "Cloud VPS Windows",
    badge: "Mulai Rp 149.000/bln",
    plans: [
      { name: "VPS-W-S", price: "149.000", cpu: "2 vCPU", ram: "4 GB", storage: "80 GB NVMe", bandwidth: "2 TB", popular: false },
      { name: "VPS-W-M", price: "249.000", cpu: "4 vCPU", ram: "8 GB", storage: "160 GB NVMe", bandwidth: "4 TB", popular: true },
      { name: "VPS-W-L", price: "449.000", cpu: "8 vCPU", ram: "16 GB", storage: "320 GB NVMe", bandwidth: "6 TB", popular: false },
      { name: "VPS-W-XL", price: "799.000", cpu: "16 vCPU", ram: "32 GB", storage: "640 GB NVMe", bandwidth: "10 TB", popular: false },
    ],
  },
  {
    title: "Dedicated Server",
    badge: "Mulai Rp 1.500.000/bln",
    plans: [
      { name: "DS-Starter", price: "1.500.000", cpu: "Xeon E3-1230", ram: "16 GB", storage: "2x500 GB SSD", bandwidth: "Unli 100 Mbps", popular: false },
      { name: "DS-Business", price: "2.500.000", cpu: "Xeon E5-2670", ram: "32 GB", storage: "2x1 TB NVMe", bandwidth: "Unli 1 Gbps", popular: true },
      { name: "DS-Enterprise", price: "4.500.000", cpu: "2x Xeon Gold", ram: "128 GB", storage: "4x1 TB NVMe", bandwidth: "Unli 10 Gbps", popular: false },
    ],
  },
];

const addons = [
  { name: "Backup Harian (7 hari retensi)", price: "20.000/bln" },
  { name: "Snapshot Storage (per 10 GB)", price: "5.000/bln" },
  { name: "IP Address Tambahan", price: "15.000/bln" },
  { name: "SSL Gratis (Let", price: "Encrypt)" },
  { name: "Monitoring Tambahan", price: "10.000/bln" },
];

const comparisonFeatures = [
  { feature: "SSD NVMe", vps: true, dedicated: true },
  { feature: "Proteksi DDoS", vps: true, dedicated: true },
  { feature: "Full Root Access", vps: true, dedicated: true },
  { feature: "Panel Kontrol", vps: true, dedicated: true },
  { feature: "Hardware Eksklusif", vps: false, dedicated: true },
  { feature: "IPMI Access", vps: false, dedicated: true },
  { feature: "Custom Hardware", vps: false, dedicated: true },
];

export default function PricingPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Harga Transparan</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Harga Semua Layanan</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Harga tetap, tidak ada biaya tersembunyi. Semua harga sudah termasuk proteksi DDoS dan support 24/7.
          </p>
        </div>

        {categories.map((category) => (
          <div key={category.title} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{category.title}</h2>
              <Badge variant="secondary">{category.badge}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-medium">Paket</th>
                    <th className="text-left py-3 pr-4 font-medium">CPU</th>
                    <th className="text-left py-3 pr-4 font-medium">RAM</th>
                    <th className="text-left py-3 pr-4 font-medium">Storage</th>
                    <th className="text-left py-3 pr-4 font-medium">Bandwidth</th>
                    <th className="text-left py-3 pr-4 font-medium">Harga</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody>
                  {category.plans.map((plan) => (
                    <tr key={plan.name} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${plan.popular ? "bg-primary/5" : ""}`}>
                      <td className="py-3 pr-4 font-medium">
                        {plan.name}
                        {plan.popular && <Badge className="ml-2 text-xs" variant="default">Populer</Badge>}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{plan.cpu}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{plan.ram}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{plan.storage}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{plan.bandwidth}</td>
                      <td className="py-3 pr-4 font-bold text-primary">Rp {plan.price}/bln</td>
                      <td className="py-3">
                        <Link href="/order" className={buttonVariants({ size: "sm", variant: plan.popular ? "default" : "outline" })}>
                          Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <Separator className="my-12" />

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Add-On Tersedia</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addons.map((addon) => (
              <div key={addon.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{addon.name}</span>
                </div>
                <span className="text-sm font-medium text-primary">{addon.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Perbandingan VPS vs Dedicated</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-medium">Fitur</th>
                  <th className="text-center py-3 pr-4 font-medium">Cloud VPS</th>
                  <th className="text-center py-3 font-medium">Dedicated Server</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-3 pr-4">{row.feature}</td>
                    <td className="py-3 pr-4 text-center">
                      {row.vps ? <CheckCircle className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </td>
                    <td className="py-3 text-center">
                      {row.dedicated ? <CheckCircle className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center bg-primary/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Ada Pertanyaan tentang Harga?</h2>
          <p className="text-muted-foreground mb-6">Tim sales kami siap membantu Anda memilih paket yang tepat.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className={buttonVariants()}>Daftar &amp; Mulai Sekarang</Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Hubungi Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
