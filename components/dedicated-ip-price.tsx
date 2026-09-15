"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function DedicatedIpPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ price: number }>("/dedicated-ip-addon-price")
      .then((res) => setPrice(res.data.price))
      .catch(() => {});
  }, []);

  return <>{(price ?? 100000).toLocaleString("id-ID")}</>;
}
