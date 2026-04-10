import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderClient } from "./OrderClient";

export const metadata: Metadata = {
  title: "Order VPS",
  description: "Pesan Cloud VPS Linux atau Windows dengan durasi fleksibel dan harga terjangkau.",
};

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Memuat...</div>}>
      <OrderClient />
    </Suspense>
  );
}
