import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatVND, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/store/types";

const statuses: { v: OrderStatus; label: string }[] = [
  { v: "pending", label: "Chờ xử lý" },
  { v: "confirmed", label: "Đã xác nhận" },
  { v: "shipping", label: "Đang giao" },
  { v: "delivered", label: "Đã giao" },
  { v: "cancelled", label: "Huỷ" },
];

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

function OrdersAdmin() {
  const { orders, updateOrderStatus, deleteOrder } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [view, setView] = useState<Order | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold">Đơn hàng</h1><p className="text-muted-foreground">Tổng {orders.length} đơn</p></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | "all")} className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="all">Tất cả</option>
          {statuses.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Mã</th><th>Khách</th><th>Ngày</th><th>Tổng</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td>{o.customerName}<div className="text-xs text-muted-foreground">{o.customerPhone}</div></td>
                <td className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                <td className="font-semibold">{formatVND(o.total)}</td>
                <td>
                  <select value={o.status} onChange={(e) => { updateOrderStatus(o.id, e.target.value as OrderStatus); toast.success("Đã cập nhật"); }} className="h-8 rounded border bg-background px-2 text-xs">
                    {statuses.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </td>
                <td className="pr-4 text-right">
                  <Button size="icon" variant="ghost" onClick={() => setView(o)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá đơn?")) { deleteOrder(o.id); toast.success("Đã xoá"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Chưa có đơn</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Chi tiết đơn {view?.id}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 rounded-lg bg-muted/50 p-3">
                <div><b>Khách:</b> {view.customerName} ({view.customerPhone})</div>
                <div><b>Địa chỉ:</b> {view.customerAddress}</div>
                <div><b>Thanh toán:</b> {view.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}</div>
                {view.note && <div><b>Ghi chú:</b> {view.note}</div>}
              </div>
              <div className="space-y-2">
                {view.items.map((i) => (
                  <div key={i.productId} className="flex gap-3">
                    <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />
                    <div className="flex-1"><div className="font-medium">{i.name}</div><div className="text-xs text-muted-foreground">x{i.quantity} · {formatVND(i.price)}</div></div>
                    <div className="font-semibold">{formatVND(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatVND(view.subtotal)}</span></div>
                <div className="flex justify-between"><span>Giảm giá</span><span className="text-success">-{formatVND(view.discount)}</span></div>
                <div className="flex justify-between"><span>Vận chuyển</span><span>{formatVND(view.shippingFee)}</span></div>
                <div className="flex justify-between font-bold"><span>Tổng</span><span className="text-primary">{formatVND(view.total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
