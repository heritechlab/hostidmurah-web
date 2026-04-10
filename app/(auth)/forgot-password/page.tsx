"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/ui/turnstile";
import { api } from "@/lib/api";

const forgotSchema = z.object({
  email: z.string().email("Email tidak valid"),
});
type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [cfToken, setCfToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotForm) => {
    if (!cfToken) {
      toast.error("Selesaikan verifikasi Turnstile terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", {
        email: values.email,
        cf_token: cfToken,
      });
      setSentEmail(values.email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Gagal mengirim email. Coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = useCallback((token: string) => setCfToken(token), []);
  const handleExpire = useCallback(() => setCfToken(null), []);

  if (sent) {
    return (
      <div className="w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Email Terkirim!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link reset password telah dikirim ke
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{sentEmail}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Periksa folder <strong>Spam</strong> jika tidak ada di kotak masuk.
          Link berlaku selama <strong>1 jam</strong>.
        </p>
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full h-10"
            onClick={() => {
              setSent(false);
              setCfToken(null);
            }}
          >
            Kirim ulang email
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Lupa Password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-center">
          <Turnstile onVerify={handleVerify} onExpire={handleExpire} />
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          disabled={isSubmitting || !cfToken}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Link Reset"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
