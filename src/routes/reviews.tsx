import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, useCurrentUser } from "@/store/useStore";
import { useNavigate } from "@tanstack/react-router";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({ component: ReviewsPage });

function ReviewsPage() {
  const reviews = useStore((s) => s.reviews);
  const products = useStore((s) => s.products);
  const addReview = useStore((s) => s.addReview);
  const user = useCurrentUser();

  // local fallbacks so UI works even if Zustand persist rehydrate timing
  const [localProducts, setLocalProducts] = useState<any[] | null>(null);
  const [localReviews, setLocalReviews] = useState<any[] | null>(null);

  useEffect(() => {
    if (products.length === 0 && !localProducts) {
      (async () => {
        try {
          const res = await fetch('http://localhost:4000/api/products');
          if (!res.ok) return;
          setLocalProducts(await res.json());
        } catch (e) { console.debug('fetch products failed', e); }
      })();
    }
    if (reviews.length === 0 && !localReviews) {
      (async () => {
        try {
          const res = await fetch('http://localhost:4000/api/reviews');
          if (!res.ok) return;
          setLocalReviews(await res.json());
        } catch (e) { console.debug('fetch reviews failed', e); }
      })();
    }
  }, [products.length, reviews.length, localProducts, localReviews]);

  const [productId, setProductId] = useState<string>((products[0]?.id ?? null) as string);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const navigate = useNavigate();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) { toast.error("Vui lòng đăng nhập để gửi đánh giá"); return; }
    if (!productId) { toast.error("Chọn sản phẩm"); return; }
    if (rating < 1 || rating > 5) { toast.error("Chọn số sao hợp lệ"); return; }
    await addReview({ productId, userId: user.id, userName: user.fullName, rating, comment } as any);
    toast.success("Cảm ơn bạn đã đánh giá");
    setComment("");
    setRating(5);
    navigate({ to: "/reviews" });
  };

  const effectiveProducts = products.length ? products : (localProducts ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Đánh giá của người dùng</h1>
        <p className="text-muted-foreground">Tổng {reviews.length} đánh giá</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            {reviews.length === 0 && <div className="py-12 text-center text-muted-foreground">Chưa có đánh giá</div>}
            <div className="space-y-3">
              {reviews.map((r) => {
                const p = products.find((x) => x.id === r.productId);
                return (
                  <div key={r.id} className="flex gap-3 rounded-md border p-3">
                    <div className="w-12 flex-shrink-0">
                      {p && <img src={p.image} alt="" className="h-12 w-12 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{p ? <Link to={`/products/${p.slug}`}>{p.name}</Link> : "Sản phẩm đã xoá"}</div>
                        <div className="flex items-center gap-1 text-warning">
                          {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">bởi {r.userName} • {formatDate(r.createdAt)}</div>
                      <div className="mt-2 text-sm text-muted-foreground">{r.comment}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 font-semibold">Gửi đánh giá</h3>
          {!user ? (
            <div className="text-sm text-muted-foreground">Vui lòng <Link to="/login" className="text-primary">đăng nhập</Link> để gửi đánh giá.</div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label>Sản phẩm</Label>
                <select className="w-full rounded border p-2" value={productId ?? ""} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">-- Chọn sản phẩm --</option>
                  {effectiveProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Đánh giá</Label>
                <div className="flex gap-2 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Button key={i} variant={rating === i + 1 ? undefined : "outline"} size="sm" onClick={() => setRating(i + 1)}>{i + 1}★</Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Nội dung</Label>
                <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
              <Button type="submit" onClick={submit} className="w-full">Gửi đánh giá</Button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
