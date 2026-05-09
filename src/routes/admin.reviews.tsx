import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const { reviews, products, deleteReview } = useStore();

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-bold">Đánh giá sản phẩm</h1><p className="text-muted-foreground">Tổng {reviews.length} đánh giá</p></div>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Sản phẩm</th><th>Người đánh giá</th><th>Điểm</th><th>Nội dung</th><th>Ngày</th><th></th></tr>
          </thead>
          <tbody>
            {reviews.map((r) => {
              const p = products.find((x) => x.id === r.productId);
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3"><div className="flex items-center gap-2">{p && <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />}<span className="line-clamp-1 font-medium">{p?.name}</span></div></td>
                  <td>{r.userName}</td>
                  <td><div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div></td>
                  <td className="max-w-md text-muted-foreground line-clamp-2">{r.comment}</td>
                  <td className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                  <td><Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá?")) { deleteReview(r.id); toast.success("Đã xoá"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                </tr>
              );
            })}
            {reviews.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Chưa có đánh giá</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
