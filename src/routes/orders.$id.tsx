import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore } from "@/store/useStore";
import { formatVND, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Truck, Package } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({ component: OrderDetail });

const steps = [
  { key: "pending", label: "Chờ xử lý", icon: Clock },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
  { key: "shipping", label: "Đang giao", icon: Truck },
  { key: "delivered", label: "Đã giao", icon: Package },
];

function OrderDetail() {
  const { id } = Route.useParams();
  const order = useStore((s) => s.orders.find((o) => o.id === id));

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col"><ShopHeader />
        <div className="container mx-auto flex-1 px-4 py-20 text-center">
          <p className="text-muted-foreground">Không tìm thấy đơn.</p>
          <Button asChild className="mt-4"><Link to="/orders">Quay lại</Link></Button>
        </div><ShopFooter />
      </div>
    );
  }

  const currentStep = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">← Lịch sử mua hàng</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Đơn hàng #{order.id}</h1>
            <p className="text-sm text-muted-foreground">Đặt lúc {formatDateTime(order.createdAt)}</p>
          </div>
          {order.status === "cancelled" ? (
            <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive">Đã huỷ</Badge>
          ) : (
            <Badge className="bg-success text-success-foreground">Đang xử lý</Badge>
          )}
        </div>

        {order.status !== "cancelled" && (
          <div className="mt-6 rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const active = i <= currentStep;
                return (
                  <div key={s.key} className="flex flex-1 flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className={`mt-2 text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                    {i < steps.length - 1 && <div className={`absolute h-1 ${active ? "bg-primary" : "bg-muted"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 font-semibold">Sản phẩm</h3>
            <div className="space-y-3">
              {order.items.map((i) => (
                <div key={i.productId} className="flex gap-3">
                  <img src={i.image} alt="" className="h-16 w-16 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="12">Ảnh</text></svg>')}`; }} />
                  <div className="flex-1"><div className="font-medium">{i.name}</div><div className="text-xs text-muted-foreground">SL: {i.quantity} × {formatVND(i.price)}</div></div>
                  <div className="font-semibold">{formatVND(i.price * i.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 text-sm">
              <h3 className="mb-3 font-semibold">Người nhận</h3>
              <div>{order.customerName}</div>
              <div className="text-muted-foreground">{order.customerPhone}</div>
              <div className="text-muted-foreground">{order.customerAddress}</div>
              {order.note && <div className="mt-2 italic text-muted-foreground">Ghi chú: {order.note}</div>}
            </div>
            <div className="rounded-xl border bg-card p-5 text-sm">
              <h3 className="mb-3 font-semibold">Thanh toán</h3>
              <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span className="text-success">-{formatVND(order.discount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</span></div>
              <div className="my-2 border-t" />
              <div className="flex justify-between font-bold"><span>Tổng</span><span className="text-primary">{formatVND(order.total)}</span></div>
              <div className="mt-2 text-xs text-muted-foreground">Phương thức: {order.paymentMethod === "cod" ? "Tiền mặt khi nhận" : "Chuyển khoản"}</div>
            </div>
          </div>
        </div>
      </div>
      <ShopFooter />
    </div>
  );
}
