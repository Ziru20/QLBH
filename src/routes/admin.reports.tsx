import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatVND } from "@/lib/format";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

function ReportsPage() {
  const { orders, products, categories } = useStore();
  const valid = orders.filter((o) => o.status !== "cancelled");

  const revenue = valid.reduce((a, o) => a + o.total, 0);
  const aov = valid.length ? revenue / valid.length : 0;

  // Revenue by month (last 6)
  const months = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const k = `${d.getMonth() + 1}/${d.getFullYear()}`;
      map.set(k, 0);
    }
    valid.forEach((o) => {
      const d = new Date(o.createdAt);
      const k = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + o.total);
    });
    return Array.from(map, ([month, value]) => ({ month, value }));
  }, [valid]);

  const maxMonth = Math.max(...months.map((m) => m.value), 1);

  // Top products
  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    valid.forEach((o) => o.items.forEach((i) => { map.set(i.productId, (map.get(i.productId) ?? 0) + i.quantity); }));
    return Array.from(map, ([id, qty]) => ({ product: products.find((p) => p.id === id), qty })).filter((x) => x.product).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [valid, products]);

  // By category
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    valid.forEach((o) => o.items.forEach((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (!p) return;
      map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + i.price * i.quantity);
    }));
    return Array.from(map, ([cid, value]) => ({ category: categories.find((c) => c.id === cid)?.name ?? "?", value }));
  }, [valid, products, categories]);

  const byStatus = (["pending","confirmed","shipping","delivered","cancelled"] as const).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-bold">Thống kê & báo cáo</h1><p className="text-muted-foreground">Phân tích doanh thu và hiệu quả kinh doanh</p></div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-gradient-primary p-6 text-primary-foreground shadow-glow">
          <div className="text-sm opacity-90">Tổng doanh thu</div>
          <div className="mt-2 font-display text-3xl font-bold">{formatVND(revenue)}</div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Đơn thành công</div>
          <div className="mt-2 font-display text-3xl font-bold">{valid.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Giá trị đơn TB</div>
          <div className="mt-2 font-display text-3xl font-bold">{formatVND(Math.round(aov))}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-5 font-semibold">Doanh thu 6 tháng gần nhất</h3>
          <div className="flex h-56 items-end gap-3">
            {months.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-xs font-semibold">{m.value > 0 ? formatVND(m.value).replace(" ₫", "") : ""}</div>
                <div className="w-full rounded-t-md bg-gradient-primary transition-all" style={{ height: `${(m.value / maxMonth) * 180 + 4}px` }} />
                <div className="text-xs text-muted-foreground">{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Trạng thái đơn</h3>
          <div className="space-y-2">
            {byStatus.map((b) => (
              <div key={b.s} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{b.s}</span>
                <span className="font-semibold">{b.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {topProducts.length === 0 && <div className="text-sm text-muted-foreground">Chưa có dữ liệu</div>}
            {topProducts.map(({ product, qty }, i) => product && (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                <img src={product.image} alt="" className="h-10 w-10 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />
                <div className="flex-1 text-sm"><div className="font-medium line-clamp-1">{product.name}</div><div className="text-xs text-muted-foreground">{formatVND(product.price)}</div></div>
                <div className="text-sm font-semibold">{qty} đã bán</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Doanh thu theo danh mục</h3>
          {byCategory.length === 0 && <div className="text-sm text-muted-foreground">Chưa có dữ liệu</div>}
          <div className="space-y-3">
            {byCategory.map((c) => {
              const max = Math.max(...byCategory.map((x) => x.value), 1);
              return (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm"><span>{c.category}</span><span className="font-semibold">{formatVND(c.value)}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${(c.value / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
