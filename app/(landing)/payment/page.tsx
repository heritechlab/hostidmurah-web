import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentClient } from "./PaymentClient";

export const metadata: Metadata = {
  title: "Pembayaran",
  description: "Selesaikan pembayaran untuk mengaktifkan server Anda.",
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Memuat...</div>}>
      <PaymentClient />
    </Suspense>
  );
}
