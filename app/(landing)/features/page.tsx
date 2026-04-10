import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, Globe, Headphones, Clock, Server, BarChart, Lock, RefreshCw, HardDrive } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Fitur Unggulan",
  description: "Temukan fitur-fitur unggulan HostIDMurah: uptime 99.9%, DDoS protection, SSD NVMe, dan support 24/7.",
};

const features = [
  {
    icon: Zap,
    title: "SSD NVMe Gen 4",
    description: "Storage super cepat dengan kecepatan baca/tulis hingga 7.000 MB/s. Aplikasi Anda berjalan lebih responsif.",
  },
  {
    icon: Shield,
    title: "Proteksi DDoS Advanced",
    description: "Perlindungan otomatis dari serangan DDoS hingga 1 Tbps. Server Anda tetap online saat diserang.",
  },
  {
    icon: Globe,
    title: "Data Center Jakarta",
    description: "Server berlokasi di data center tier-3 Jakarta dengan latensi ultra-rendah untuk pengguna Indonesia.",
  },
  {
    icon: Headphones,
    title: "Support 24/7/365",
    description: "Tim teknis berpengalaman siap membantu via live chat, tiket, dan WhatsApp kapan saja Anda butuhkan.",
  },
  {
    icon: Clock,
    title: "Provisioning Instan",
    description: "VPS Anda aktif dalam 2-5 menit setelah pembayaran dikonfirmasi. Tidak perlu menunggu lama.",
  },
  {
    icon: Server,
    title: "Full Root Access",
    description: "Kontrol penuh atas server. Install software, konfigurasi firewall, dan kelola server sesuka Anda.",
  },
  {
    icon: BarChart,
    title: "Monitoring Real-time",
    description: "Pantau penggunaan CPU, RAM, dan bandwidth server Anda secara real-time melalui panel kontrol.",
  },
  {
    icon: RefreshCw,
    title: "Backup Otomatis",
    description: "Backup harian otomatis tersedia sebagai add-on. Data Anda aman dan bisa di-restore kapan saja.",
  },
  {
    icon: HardDrive,
    title: "Snapshot",
    description: "Buat snapshot server sebelum perubahan besar. Rollback ke kondisi sebelumnya dalam hitungan menit.",
  },
  {
    icon: Lock,
    title: "Jaringan Private",
    description: "Koneksi antar VPS melalui jaringan private yang aman dan bebas biaya bandwidth internal.",
  },
];

const uptime = [
  { month: "Jan", value: 99.99 },
  { month: "Feb", value: 99.97 },
  { month: "Mar", value: 100 },
  { month: "Apr", value: 99.98 },
  { month: "Mei", value: 99.99 },
  { month: "Jun", value: 100 },
];

export default function FeaturesPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Fitur Unggulan</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Infrastruktur Kelas Enterprise</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Semua fitur yang Anda butuhkan untuk menjalankan aplikasi dengan performa tinggi dan keamanan terjamin.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:border-primary transition-colors">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Track Record Uptime 6 Bulan Terakhir</h2>
            <p className="text-muted-foreground mt-2">Komitmen kami terhadap keandalan layanan</p>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {uptime.map((u) => (
              <div key={u.month} className="text-center">
                <div className="h-24 bg-primary/20 rounded-lg flex items-end justify-center mb-2 overflow-hidden">
                  <div
                    className="w-full bg-primary rounded-lg transition-all"
                    style={{ height: `${(u.value / 100) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-medium">{u.month}</p>
                <p className="text-xs text-primary font-bold">{u.value}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Siap Memulai?</h2>
          <p className="text-muted-foreground mb-6">Pilih paket yang sesuai dengan kebutuhan Anda</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing" className={buttonVariants()}>Lihat Semua Harga</Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Tanya Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
