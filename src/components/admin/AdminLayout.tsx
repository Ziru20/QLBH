import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentUser } from "@/store/useStore";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, BarChart3, Tag, Star, Shield, Home, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";

const items = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { to: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { to: "/admin/customers", label: "Khách hàng", icon: Users },
  { to: "/admin/vouchers", label: "Khuyến mãi", icon: Tag },
  { to: "/admin/reviews", label: "Đánh giá", icon: Star },
  { to: "/admin/users", label: "Phân quyền", icon: Shield },
  { to: "/admin/reports", label: "Thống kê", icon: BarChart3 },
];

export function AdminLayout() {
  const user = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  // ✅ chỉ để user

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><span className="font-display font-bold">M</span></div>
          <div>
            <div className="font-display text-base font-bold">MaiShop ECMS</div>
            <div className="text-[11px] text-sidebar-foreground/60">Quản trị hệ thống</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              activeOptions={{ exact: it.exact }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-sm">
          <div className="mb-2 px-2">
            <div className="font-medium">{user.fullName}</div>
            <div className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</div>
          </div>
          <Link to="/" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-sidebar-accent"><Home className="h-3.5 w-3.5" />Về cửa hàng</Link>
          <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-sidebar-accent"><LogOut className="h-3.5 w-3.5" />Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
