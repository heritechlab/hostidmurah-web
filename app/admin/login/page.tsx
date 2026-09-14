"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/ui/turnstile";
import { api } from "@/lib/api";
import { setStoredAuth, type User } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [cfToken, setCfToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const handleVerify = useCallback((token: string) => setCfToken(token), []);
  const handleExpire = useCallback(() => setCfToken(null), []);

  const onSubmit = async (values: LoginForm) => {
    if (!cfToken) {
      toast.error("Selesaikan verifikasi Turnstile terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
        turnstile_token: cfToken,
      });
      const { access_token } = data;

      const { data: userData } = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (userData.role !== "admin") {
        toast.error("Akun ini tidak memiliki akses admin.");
        return;
      }

      setStoredAuth(access_token, userData);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Email atau password salah.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <ShieldAlert className="size-6" />
          </div>
          <h1 className="text-xl font-bold">Admin HostIDMurah</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khusus untuk pengelola sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@hostidmurah.web.id"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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

          <div className="flex justify-center">
            <Turnstile onVerify={handleVerify} onExpire={handleExpire} />
          </div>

          <Button type="submit" className="w-full h-10" disabled={isSubmitting || !cfToken}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Masuk...
              </>
            ) : (
              "Masuk sebagai Admin"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
