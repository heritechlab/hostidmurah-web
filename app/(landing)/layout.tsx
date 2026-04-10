import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
