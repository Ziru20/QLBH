import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore, useCurrentUser } from "@/store/useStore";
import { useMemo } from "react";
import { formatVND, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-warning/15 text-warning-foreground border-warning" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700 border-blue-300" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-300" },
  delivered: { label: "Đã giao", color: "bg-success/15 text-success border-success" },
  cancelled: { label: "Đã huỷ", color: "bg-destructive/15 text-destructive border-destructive" },
};

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const allOrders = useStore((s) => s.orders);
  const orders = useMemo(() => allOrders.filter((o) => o.userId === user?.id), [allOrders, user?.id]);

  console.debug("OrdersPage render", { userId: user?.id, ordersCount: orders.length });

  useEffect(() => {
    console.debug("OrdersPage effect", { user });
  if (!user) {
    navigate({ to: "/login" });
  }
}, [user]);
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Lịch sử mua hàng</h1>
        {orders.length === 0 ? (
          <div className="rounded-xl border bg-card py-20 text-center text-muted-foreground">Chưa có đơn hàng nào.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="block rounded-xl border bg-card p-5 transition hover:shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-bold">#{o.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                  </div>
                  <Badge variant="outline" className={statusMap[o.status].color}>{statusMap[o.status].label}</Badge>
                  <div className="font-bold text-primary">{formatVND(o.total)}</div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{o.items.length} sản phẩm · {o.items[0]?.name}{o.items.length > 1 ? `, +${o.items.length - 1}` : ""}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <ShopFooter />
    </div>
  );
}
