import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatVND, formatDateTime } from "@/lib/format";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { products, orders, users } = useStore();
  const customers = users.filter((u) => u.role === "customer");
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0);
  const recent = orders.slice(0, 5);

  const stats = [
    { label: "Doanh thu", value: formatVND(revenue), icon: DollarSign, color: "from-primary to-primary-glow" },
    { label: "Đơn hàng", value: orders.length, icon: ShoppingBag, color: "from-blue-500 to-blue-400" },
    { label: "Sản phẩm", value: products.length, icon: Package, color: "from-success to-emerald-400" },
    { label: "Khách hàng", value: customers.length, icon: Users, color: "from-warning to-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Chào mừng bạn đến với trang quản trị MaiShop ECMS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-soft">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-white`}><s.icon className="h-5 w-5" /></div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Đơn hàng gần đây</h3>
          {recent.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Chưa có đơn hàng</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="pb-2">Mã</th><th>Khách</th><th>Ngày</th><th>Trạng thái</th><th className="text-right">Tổng</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 font-mono text-xs">{o.id}</td>
                    <td>{o.customerName}</td>
                    <td className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                    <td><Badge variant="outline" className="text-xs">{o.status}</Badge></td>
                    <td className="text-right font-semibold">{formatVND(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Sản phẩm sắp hết</h3>
          <div className="space-y-3">
            {products.filter((p) => p.stock < 30).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />
                <div className="flex-1 text-sm"><div className="line-clamp-1 font-medium">{p.name}</div><div className="text-xs text-muted-foreground">Còn {p.stock}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
