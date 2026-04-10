import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog & Artikel | HostIDMurah",
  description: "Tips VPS, tutorial server, dan update layanan HostIDMurah. Pelajari cara optimal mengelola VPS Linux dan Windows Anda.",
};

const articles = [
  {
    slug: "cara-install-nginx-di-vps-ubuntu",
    title: "Cara Install dan Konfigurasi Nginx di VPS Ubuntu 22.04",
    excerpt: "Panduan lengkap instalasi Nginx di Ubuntu 22.04, mulai dari setup server block, SSL dengan Let's Encrypt, hingga optimasi performa untuk produksi.",
    category: "Tutorial",
    readTime: "8 menit",
    date: "2026-04-05",
    author: "Tim HostIDMurah",
  },
  {
    slug: "vps-linux-vs-windows-pilih-yang-mana",
    title: "VPS Linux vs Windows: Mana yang Tepat untuk Bisnis Anda?",
    excerpt: "Perbandingan mendalam antara VPS Linux dan Windows dari sisi performa, harga, kemudahan penggunaan, dan use case yang paling cocok untuk masing-masing.",
    category: "Tips VPS",
    readTime: "6 menit",
    date: "2026-03-28",
    author: "Tim HostIDMurah",
  },
  {
    slug: "cara-setup-wordpress-di-vps",
    title: "Cara Deploy WordPress di VPS dengan LEMP Stack",
    excerpt: "Tutorial step-by-step setup WordPress self-hosted di VPS menggunakan Linux, Nginx, MySQL, dan PHP (LEMP Stack) untuk performa terbaik.",
    category: "Tutorial",
    readTime: "12 menit",
    date: "2026-03-20",
    author: "Tim HostIDMurah",
  },
  {
    slug: "memilih-spesifikasi-vps-yang-tepat",
    title: "Panduan Memilih Spesifikasi VPS yang Tepat untuk Website Anda",
    excerpt: "Bingung memilih RAM, CPU, dan storage VPS? Artikel ini membantu Anda menentukan spesifikasi yang sesuai berdasarkan jenis aplikasi dan traffic.",
    category: "Tips VPS",
    readTime: "5 menit",
    date: "2026-03-15",
    author: "Tim HostIDMurah",
  },
  {
    slug: "proteksi-ddos-apa-dan-bagaimana",
    title: "Proteksi DDoS: Apa Itu dan Bagaimana HostIDMurah Melindungi Server Anda",
    excerpt: "Penjelasan lengkap tentang serangan DDoS, dampaknya pada server, dan bagaimana sistem proteksi otomatis HostIDMurah menjaga uptime layanan Anda.",
    category: "Keamanan",
    readTime: "7 menit",
    date: "2026-03-10",
    author: "Tim HostIDMurah",
  },
  {
    slug: "backup-vps-dengan-rsync",
    title: "Cara Backup VPS Otomatis dengan Rsync dan Cron Job",
    excerpt: "Lindungi data server Anda dengan backup otomatis menggunakan rsync. Panduan setup cron job untuk backup harian, mingguan, dan bulanan.",
    category: "Tutorial",
    readTime: "10 menit",
    date: "2026-03-05",
    author: "Tim HostIDMurah",
  },
];

const categoryColors: Record<string, string> = {
  Tutorial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Tips VPS": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Keamanan: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Update Layanan": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Tag className="h-3.5 w-3.5" />
            Blog & Artikel
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Tips, Tutorial & Update Layanan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pelajari cara mengelola VPS, tips keamanan server, dan update terbaru dari HostIDMurah.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured article */}
        <div className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Artikel Terbaru
          </h2>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="rounded-xl border border-border bg-card p-8 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[featured.category] ?? ""}`}>
                  {featured.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(featured.date)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {featured.readTime} baca
                </span>
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors mb-3">
                {featured.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Baca selengkapnya <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>

        {/* Article grid */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Artikel Lainnya
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
              <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[article.category] ?? ""}`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
