import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = await login(email, password);
    if (!u) { toast.error("Sai email hoặc mật khẩu"); return; }
    toast.success(`Xin chào ${u.fullName}!`);
    navigate({ to: u.role === "customer" ? "/" : "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-elevated">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><span className="font-display font-bold">M</span></div>
          <span className="font-display text-2xl font-bold">MaiShop</span>
        </Link>
        <h1 className="font-display text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chào mừng trở lại với MaiShop ECMS</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
          <div><Label>Mật khẩu</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
          <Button type="submit" size="lg" className="w-full">Đăng nhập</Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản? <Link to="/register" className="font-semibold text-primary hover:underline">Đăng ký</Link>
        </div>

        <div className="mt-6 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <div className="font-semibold mb-1">Tài khoản demo:</div>
          <div>👨‍💼 Admin: admin@shop.vn / admin123</div>
          <div>👨‍💻 Staff: staff@shop.vn / staff123</div>
          <div>🛒 Khách: customer@shop.vn / 123456</div>
        </div>
      </div>
    </div>
  );
}
