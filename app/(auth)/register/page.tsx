"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/ui/turnstile";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
    referral_code: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });
type RegisterForm = z.infer<typeof registerSchema>;

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "https://hostidmurah.web.id/api"}/auth/google`;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [cfToken, setCfToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    if (!cfToken) {
      toast.error("Selesaikan verifikasi Turnstile terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerUser(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          referral_code: values.referral_code,
        },
        cfToken
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Gagal mendaftar. Coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = useCallback((token: string) => setCfToken(token), []);
  const handleExpire = useCallback(() => setCfToken(null), []);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Buat Akun</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>

        {/* Google OAuth */}
        <a
          href={GOOGLE_AUTH_URL}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full h-10 gap-2 mb-4"
          )}
        >
          {/* Google icon */}
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Daftar dengan Google
        </a>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">atau dengan email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              No. WhatsApp{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              autoComplete="tel"
              {...register("phone")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Konfirmasi Password</Label>
            <Input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referral_code">
              Kode Referral{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Input
              id="referral_code"
              placeholder="Masukkan kode referral"
              {...register("referral_code")}
            />
          </div>

          {/* Turnstile */}
          <div className="flex justify-center pt-1">
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
                Mendaftar...
              </>
            ) : (
              "Buat Akun"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Syarat & Ketentuan
          </Link>{" "}
          kami.
        </p>
      </div>
    </div>
  );
}
