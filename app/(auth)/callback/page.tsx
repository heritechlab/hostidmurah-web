"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setStoredAuth, type User } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Login dengan Google gagal. Coba lagi.");
      router.replace("/login");
      return;
    }

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    api
      .get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        setStoredAuth(accessToken, data);
        router.replace("/dashboard");
      })
      .catch(() => {
        toast.error("Gagal memverifikasi akun. Coba login lagi.");
        router.replace("/login");
      });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">Memverifikasi akun Google...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Memuat...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
