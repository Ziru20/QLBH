import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { useStore, useCurrentUser } from "@/store/useStore";
import { formatVND, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({ component: ProductDetail });

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const product = useStore((s) => s.products.find((p) => p.slug === slug));
  const reviews = useStore((s) => s.reviews.filter((r) => r.productId === product?.id));
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const addReview = useStore((s) => s.addReview);
  const user = useCurrentUser();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <ShopHeader />
        <div className="container mx-auto flex-1 px-4 py-20 text-center">
          <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>
          <Button asChild className="mt-4"><Link to="/products">Quay lại</Link></Button>
        </div>
        <ShopFooter />
      </div>
    );
  }

  const inWishlist = wishlist.includes(product.id);
  const submitReview = () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); navigate({ to: "/login" }); return; }
    if (!comment.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
    addReview({ productId: product.id, userId: user.id, userName: user.fullName, rating, comment });
    setComment(""); toast.success("Cảm ơn đánh giá của bạn!");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="20">Ảnh sản phẩm</text></svg>')}`; }} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" />{product.rating ?? 5}</span>
              <span className="text-muted-foreground">· {reviews.length} đánh giá</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${product.stock > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
              </span>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <div className="font-display text-4xl font-bold text-primary">{formatVND(product.price)}</div>
              {product.oldPrice && <div className="pb-1 text-lg text-muted-foreground line-through">{formatVND(product.oldPrice)}</div>}
            </div>
            <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-md border">
                <button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button className="px-3 py-2" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
              </div>
              <Button size="lg" disabled={product.stock === 0} onClick={() => { addToCart(product.id, qty); toast.success("Đã thêm vào giỏ"); }}>Thêm vào giỏ</Button>
              <Button size="lg" variant="outline" onClick={() => toggleWishlist(product.id)}>
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-primary text-primary" : ""}`} />
              </Button>
            </div>

            <div className="mt-6 grid gap-3 rounded-xl border bg-card p-4 text-sm">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Giao hàng toàn quốc 1-3 ngày</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Cam kết chính hãng, đổi trả 7 ngày</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-14">
          <h2 className="mb-4 font-display text-2xl font-bold">Đánh giá ({reviews.length})</h2>
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {reviews.length === 0 && <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Chưa có đánh giá.</div>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.userName}</div>
                    <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">Viết đánh giá</h3>
              <div className="mt-3 flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}><Star className={`h-6 w-6 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} /></button>
                ))}
              </div>
              <Textarea className="mt-3" rows={4} placeholder="Cảm nhận của bạn..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button className="mt-3 w-full" onClick={submitReview}>Gửi đánh giá</Button>
            </div>
          </div>
        </div>
      </div>
      <ShopFooter />
    </div>
  );
}
