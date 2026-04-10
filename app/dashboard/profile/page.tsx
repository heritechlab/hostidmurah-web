"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional(),
});
const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Wajib diisi"),
    new_password: z.string().min(8, "Minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Password baru tidak cocok",
    path: ["confirm_password"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: errProfile },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: errPassword },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (values: ProfileForm) => {
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", values);
      await refreshUser();
      toast.success("Profil berhasil diperbarui.");
    } catch {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordForm) => {
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      toast.success("Password berhasil diubah.");
      resetPassword();
    } catch {
      toast.error("Password lama salah atau gagal mengubah password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Informasi Profil</h2>
        </div>
        <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" aria-invalid={!!errProfile.name} {...regProfile("name")} />
            {errProfile.name && <p className="text-xs text-destructive">{errProfile.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">No. WhatsApp</Label>
            <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" {...regProfile("phone")} />
          </div>
          <Button type="submit" disabled={savingProfile} className="gap-1.5">
            {savingProfile && <Loader2 className="size-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </div>

      {/* Password form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Ubah Password</h2>
        </div>
        <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Password Saat Ini</Label>
            <Input
              id="current_password"
              type="password"
              aria-invalid={!!errPassword.current_password}
              {...regPassword("current_password")}
            />
            {errPassword.current_password && (
              <p className="text-xs text-destructive">{errPassword.current_password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">Password Baru</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="Min. 8 karakter"
              aria-invalid={!!errPassword.new_password}
              {...regPassword("new_password")}
            />
            {errPassword.new_password && (
              <p className="text-xs text-destructive">{errPassword.new_password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
            <Input
              id="confirm_password"
              type="password"
              aria-invalid={!!errPassword.confirm_password}
              {...regPassword("confirm_password")}
            />
            {errPassword.confirm_password && (
              <p className="text-xs text-destructive">{errPassword.confirm_password.message}</p>
            )}
          </div>
          <Button type="submit" variant="outline" disabled={savingPassword} className="gap-1.5">
            {savingPassword && <Loader2 className="size-4 animate-spin" />}
            Ubah Password
          </Button>
        </form>
      </div>
    </div>
  );
}
