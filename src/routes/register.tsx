import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const register = useStore((s) => s.register);
  const users = useStore((s) => s.users);
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some((u) => u.email === form.email)) { toast.error("Email đã tồn tại"); return; }
    const u = await register(form as any);
    if (!u) { toast.error('Đăng ký thất bại'); return; }
    toast.success("Đăng ký thành công!");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-elevated">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><span className="font-display font-bold">M</span></div>
          <span className="font-display text-2xl font-bold">MaiShop</span>
        </Link>
        <h1 className="font-display text-2xl font-bold">Tạo tài khoản</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Họ tên</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Mật khẩu</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div><Label>Địa chỉ</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <Button type="submit" size="lg" className="w-full">Đăng ký</Button>
        </form>
        <div className="mt-4 text-center text-sm">Đã có tài khoản? <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link></div>
      </div>
    </div>
  );
}
