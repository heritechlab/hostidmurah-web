import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi tim HostIDMurah via WhatsApp, email, atau form kontak. Support 24/7 siap membantu Anda.",
};

const contacts = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+62 852-1234-8518",
    description: "Respon cepat, tersedia 24/7",
    href: "https://wa.me/6285212348518",
  },
  {
    icon: Mail,
    title: "Email",
    value: "support@hostidmurah.web.id",
    description: "Untuk pertanyaan detail",
    href: "mailto:support@hostidmurah.web.id",
  },
  {
    icon: Phone,
    title: "Telepon",
    value: "+62 21-XXXX-XXXX",
    description: "Senin - Jumat, 09.00 - 18.00",
    href: "tel:+6221XXXXXXXX",
  },
  {
    icon: MapPin,
    title: "Alamat",
    value: "Jakarta Pusat, Indonesia",
    description: "Kunjungan dengan janji",
    href: "#",
  },
];

const faqs = [
  {
    q: "Berapa lama VPS aktif setelah pembayaran?",
    a: "VPS Anda akan aktif dalam 2-5 menit setelah pembayaran dikonfirmasi secara otomatis.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), QRIS, GoPay, OVO, dan kartu kredit.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Ya, kami memberikan garansi uang kembali 7 hari untuk pelanggan baru yang tidak puas dengan layanan.",
  },
  {
    q: "Bagaimana cara upgrade paket VPS?",
    a: "Upgrade dapat dilakukan melalui panel kontrol member area kapan saja, biaya akan diprorata.",
  },
];

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Hubungi Kami</Badge>
          <h1 className="text-4xl font-bold md:text-5xl">Kami Siap Membantu</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tim support kami tersedia 24/7. Pilih metode komunikasi yang paling nyaman untuk Anda.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {contacts.map((contact) => (
            <a key={contact.title} href={contact.href} target="_blank" rel="noopener noreferrer">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <contact.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{contact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-sm">{contact.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contact.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-2 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
            <ContactForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="font-medium text-sm">{faq.q}</p>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">Jam Operasional Support</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Tiket & WhatsApp: 24 jam / 7 hari</li>
                <li>Live Chat: Senin - Jumat, 08.00 - 22.00</li>
                <li>Telepon: Senin - Jumat, 09.00 - 18.00</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
