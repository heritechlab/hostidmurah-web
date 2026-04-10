import type { ReactNode } from "react";
import Link from "next/link";
import { Server } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-8">
        <Server className="h-5 w-5" />
        HostIDMurah
      </Link>
      {children}
    </div>
  );
}
