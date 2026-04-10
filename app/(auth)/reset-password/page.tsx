"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });
type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values: ResetForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: values.password,
      });
      toast.success("Password berhasil direset! Silakan masuk dengan password baru.");
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Gagal mereset password. Link mungkin sudah kedaluwarsa.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Link Tidak Valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Link reset password tidak valid atau sudah kedaluwarsa.
        </p>
        <div className="mt-6 space-y-3">
          <Link href="/forgot-password">
            <Button className="w-full h-10">Minta Link Baru</Button>
          </Link>
          <Link
            href="/login"
            className="block text-sm text-muted-foreground hover:text-foreground text-center"
          >
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
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Atur Password Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat password baru yang kuat untuk akun Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password Baru</Label>
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
            placeholder="Ulangi password baru"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm_password}
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Password Baru"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
