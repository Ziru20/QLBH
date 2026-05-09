import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore, useCurrentUser } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const user = useCurrentUser();
  const updateProfile = useStore((s) => s.updateProfile);
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "" });

  useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    setForm({ fullName: user.fullName, email: user.email, phone: user.phone ?? "", address: user.address ?? "" });
  }, [user, navigate]);

  if (!user) return null;

  const save = () => { updateProfile(form); toast.success("Đã cập nhật"); };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Hồ sơ cá nhân</h1>
        <div className="max-w-xl rounded-xl border bg-card p-6">
          <div className="grid gap-4">
            <div><Label>Họ tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} disabled /></div>
            <div><Label>Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Địa chỉ</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <Button onClick={save} className="mt-2">Lưu thay đổi</Button>
          </div>
        </div>
      </div>
      <ShopFooter />
    </div>
  );
}
