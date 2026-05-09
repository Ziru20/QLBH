import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore, useCurrentUser } from "@/store/useStore";
import { formatVND } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, Tag } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const vouchers = useStore((s) => s.vouchers);
  const updateCartQty = useStore((s) => s.updateCartQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const items = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((i) => i.product);
  const subtotal = items.reduce((a, i) => a + i.product.price * i.quantity, 0);

  const discount = useMemo(() => {
    if (!appliedCode) return 0;
    const v = vouchers.find((x) => x.code === appliedCode && x.active);
    if (!v || subtotal < v.minOrder) return 0;
    return v.type === "percent" ? Math.round((subtotal * v.value) / 100) : v.value;
  }, [appliedCode, vouchers, subtotal]);

  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const applyVoucher = () => {
    const v = vouchers.find((x) => x.code === code.trim().toUpperCase() && x.active);
    if (!v) { toast.error("Mã không hợp lệ"); return; }
    if (subtotal < v.minOrder) { toast.error(`Đơn tối thiểu ${formatVND(v.minOrder)}`); return; }
    setAppliedCode(v.code); toast.success(`Áp dụng ${v.code} thành công`);
  };

  const checkout = () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate({ to: "/login" }); return; }
    navigate({ to: "/checkout", search: { code: appliedCode ?? "" } as never });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Giỏ hàng của bạn</h1>
        {items.length === 0 ? (
          <div className="rounded-xl border bg-card py-20 text-center">
            <p className="text-muted-foreground">Giỏ hàng trống.</p>
            <Button asChild className="mt-4"><Link to="/products">Tiếp tục mua sắm</Link></Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-4 rounded-xl border bg-card p-4">
                  <img src={i.product.image} alt={i.product.name} className="h-24 w-24 rounded-lg object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="16">Hình</text></svg>')}`; }} />
                  <div className="flex flex-1 flex-col">
                    <Link to="/products/$slug" params={{ slug: i.product.slug }} className="font-semibold hover:text-primary">{i.product.name}</Link>
                    <div className="mt-1 text-primary font-bold">{formatVND(i.product.price)}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-md border">
                        <button className="px-2 py-1" onClick={() => updateCartQty(i.productId, i.quantity - 1)}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-9 text-center text-sm">{i.quantity}</span>
                        <button className="px-2 py-1" onClick={() => updateCartQty(i.productId, i.quantity + 1)}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => removeFromCart(i.productId)} className="text-destructive hover:underline"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="hidden text-right font-semibold sm:block">{formatVND(i.product.price * i.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-3 font-semibold flex items-center gap-2"><Tag className="h-4 w-4" />Mã giảm giá</h3>
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã (vd: WELCOME10)" />
                  <Button variant="outline" onClick={applyVoucher}>Áp dụng</Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Thử: WELCOME10, FREESHIP, SALE50K</div>
              </div>
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-4 font-semibold">Tổng đơn hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatVND(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span className="text-success">-{formatVND(discount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}</span></div>
                  <div className="my-2 border-t" />
                  <div className="flex justify-between text-base font-bold"><span>Tổng cộng</span><span className="text-primary">{formatVND(total)}</span></div>
                </div>
                <Button size="lg" className="mt-4 w-full" onClick={checkout}>Tiến hành đặt hàng</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ShopFooter />
    </div>
  );
}
