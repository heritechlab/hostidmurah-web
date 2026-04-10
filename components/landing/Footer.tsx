import Link from "next/link";
import { Server } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Server: [
    { title: "Cloud VPS Linux", href: "/vps" },
    { title: "Cloud VPS Windows", href: "/vps/windows" },
    { title: "Dedicated Server", href: "/dedicated" },
    { title: "Semua Harga", href: "/pricing" },
  ],
  Hosting: [
    { title: "Shared Hosting", href: "/hosting/shared" },
    { title: "WordPress Hosting", href: "/hosting/wordpress" },
    { title: "Cloud Hosting", href: "/hosting/cloud" },
  ],
  Perusahaan: [
    { title: "Fitur Unggulan", href: "/features" },
    { title: "Blog & Artikel", href: "/blog" },
    { title: "Kontak", href: "/contact" },
  ],
  Bantuan: [
    { title: "Status Server", href: "https://status.hostidmurah.web.id" },
    { title: "Kebijakan Privasi", href: "/privacy" },
    { title: "Syarat & Ketentuan", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Server className="h-5 w-5" />
              HostIDMurah
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solusi hosting VPS dan dedicated server terpercaya di Indonesia. Uptime 99.9%, proteksi DDoS, dan support 24/7.
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Semua sistem normal
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HostIDMurah. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/6285212348518" className="hover:text-foreground transition-colors">WhatsApp: +62 852-1234-8518</a>
            <a href="mailto:support@hostidmurah.web.id" className="hover:text-foreground transition-colors">Email: support@hostidmurah.web.id</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
