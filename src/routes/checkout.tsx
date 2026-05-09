import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore, useCurrentUser } from "@/store/useStore";
import { formatVND } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

interface Search { code?: string }

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({ code: typeof s.code === "string" ? s.code : undefined }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const search = Route.useSearch();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const vouchers = useStore((s) => s.vouchers);
  const placeOrder = useStore((s) => s.placeOrder);
  const clearCart = useStore((s) => s.clearCart);

  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");

  useEffect(() => {
  if (!user) {
    navigate({ to: "/login" });
  }
}, [user]);

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.productId);
      if (!p) return null;
      return { productId: p.id, name: p.name, image: p.image, price: p.price, quantity: c.quantity };
    })
    .filter((x): x is { productId: string; name: string; image: string; price: number; quantity: number } => x !== null);
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const discount = useMemo(() => {
    const v = vouchers.find((x) => x.code === search.code && x.active);
    if (!v || subtotal < v.minOrder) return 0;
    return v.type === "percent" ? Math.round((subtotal * v.value) / 100) : v.value;
  }, [search.code, vouchers, subtotal]);
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const bankInfo = {
    bankName: "Ngân hàng ABC",
    accountNumber: "0123456789",
    accountName: "Công ty MaiShop",
    swift: "ABCXVN",
  };

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (paymentMethod !== "bank") {
      setQrDataUrl(null);
      return;
    }
    const text = `BANK:${bankInfo.bankName};ACC:${bankInfo.accountNumber};NAME:${bankInfo.accountName};AMT:${total};NOTE:Thanh toan`;
    QRCode.toDataURL(text, { width: 300 }).then((url: SetStateAction<string | null>) => setQrDataUrl(url)).catch(() => setQrDataUrl(null));
  }, [paymentMethod, bankInfo.bankName, bankInfo.accountNumber, bankInfo.accountName, total]);

  if (!user || items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col"><ShopHeader />
        <div className="container mx-auto flex-1 px-4 py-20 text-center">
          <p className="text-muted-foreground">Giỏ hàng trống.</p>
          <Button asChild className="mt-4"><Link to="/products">Mua sắm ngay</Link></Button>
        </div><ShopFooter />
      </div>
    );
  }

  const submit = async () => {
    if (!name || !phone || !address) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    if (items.length !== cart.length) { toast.error("Một số sản phẩm trong giỏ không tồn tại, vui lòng kiểm tra lại"); return; }
    try {
      const order = await placeOrder({
        userId: user.id, customerName: name, customerPhone: phone, customerAddress: address,
        items, subtotal, discount, shippingFee, total, voucherCode: search.code, paymentMethod, note,
      } as any);
      clearCart();
      toast.success("Đặt hàng thành công!");
      navigate({ to: "/orders/$id", params: { id: order.id } });
    } catch (e) {
      toast.error('Không thể đặt hàng');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Thanh toán</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Thông tin giao hàng</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Họ tên</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Số điện thoại</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              </div>
              <div className="mt-4"><Label>Địa chỉ</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="mt-4"><Label>Ghi chú</Label><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Phương thức thanh toán</h3>
              <div className="space-y-2">
                {[
                  { v: "cod", label: "Thanh toán khi nhận hàng (COD)" },
                  { v: "bank", label: "Chuyển khoản ngân hàng" },
                ].map((opt) => (
                  <label key={opt.v} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${paymentMethod === opt.v ? "border-primary bg-primary/5" : ""}`}>
                    <input type="radio" name="pay" value={opt.v} checked={paymentMethod === opt.v} onChange={() => setPaymentMethod(opt.v as "cod" | "bank")} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
                {paymentMethod === "bank" && (
                  <div className="mt-3 rounded-lg border p-3 bg-muted/30">
                    <div className="mb-2 text-sm font-medium">Thông tin chuyển khoản</div>
                    <div className="text-sm"><b>Ngân hàng:</b> {bankInfo.bankName}</div>
                    <div className="text-sm"><b>Số tài khoản:</b> {bankInfo.accountNumber}</div>
                    <div className="text-sm"><b>Chủ tài khoản:</b> {bankInfo.accountName}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <img src={qrDataUrl ?? undefined} alt="QR chuyển khoản" className="h-36 w-36 rounded" />
                      <div className="flex-1 text-sm">
                        <div className="mb-2">Quét mã QR để chuyển khoản nhanh. Ghi nội dung thanh toán là tên hoặc mã đơn để chúng tôi đối soát.</div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={async () => { await navigator.clipboard?.writeText(bankInfo.accountNumber); toast.success("Đã sao chép số tài khoản"); }}>Sao chép số TK</Button>
                          <Button size="sm" variant="outline" onClick={() => qrDataUrl && window.open(qrDataUrl, "_blank")}>Mở mã QR</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 h-fit">
            <h3 className="mb-4 font-semibold">Đơn hàng</h3>
            <div className="space-y-3 max-h-64 overflow-auto">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-3 text-sm">
                  <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = import.meta.env.PROD ? '/images/placeholder.png' : `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="14">Hình</text></svg>')}`; }} />
                  <div className="flex-1"><div className="line-clamp-1 font-medium">{i.name}</div><div className="text-xs text-muted-foreground">x{i.quantity}</div></div>
                  <div className="font-semibold">{formatVND(i.price * i.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatVND(subtotal)}</span></div>
              {search.code && <div className="flex justify-between"><span className="text-muted-foreground">Mã {search.code}</span><span className="text-success">-{formatVND(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}</span></div>
              <div className="my-2 border-t" />
              <div className="flex justify-between text-base font-bold"><span>Tổng</span><span className="text-primary">{formatVND(total)}</span></div>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={submit}>Đặt hàng</Button>
          </div>
        </div>
      </div>
      <ShopFooter />
    </div>
  );
}
