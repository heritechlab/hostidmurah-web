import type { ReactNode } from "react";
import Link from "next/link";
import { Server, Shield, Zap, Clock, CheckCircle } from "lucide-react";

const highlights = [
  { icon: Zap,          text: "VPS aktif dalam 5 menit setelah pembayaran" },
  { icon: Shield,       text: "Proteksi DDoS otomatis tanpa biaya tambahan" },
  { icon: Clock,        text: "Uptime SLA 99.9% dengan monitoring 24/7" },
  { icon: CheckCircle,  text: "Support responsif via tiket & WhatsApp" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col bg-primary text-primary-foreground p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.75_0.22_260/0.25),_transparent_60%)]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-primary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur">
              <Server className="h-5 w-5" />
            </div>
            HostIDMurah
          </Link>

          {/* Main copy */}
          <div className="mt-auto mb-auto pt-16">
            <h1 className="text-4xl font-bold leading-tight">
              Cloud VPS Indonesia<br />
              <span className="text-primary-foreground/80">Terpercaya &amp; Terjangkau</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
              Mulai dari Rp 49.000/bulan. SSD NVMe, proteksi DDoS gratis, dan full root access.
            </p>

            <ul className="mt-10 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-primary-foreground/90">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <div className="mt-auto rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 p-5">
            <p className="text-sm text-primary-foreground/80 italic leading-relaxed">
              &ldquo;HostIDMurah sudah saya pakai 2 tahun. Uptime selalu bagus, support cepat respons, dan harga paling masuk akal di Indonesia.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-semibold">Ahmad Fauzi</p>
                <p className="text-xs text-primary-foreground/60">Developer Freelance, Jakarta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Logo for mobile */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-8 lg:hidden">
          <Server className="h-5 w-5" />
          HostIDMurah
        </Link>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
