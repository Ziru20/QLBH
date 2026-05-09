import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/store/types";
import { formatVND } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { placeholderDataUrl } from "@/lib/image";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const inWishlist = wishlist.includes(product.id);

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:shadow-elevated">
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
          <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = placeholderDataUrl(product.name); }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      {product.oldPrice && (
        <span className="absolute left-3 top-3 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
          -{Math.round((1 - product.price / product.oldPrice) * 100)}%
        </span>
      )}
      <button
        onClick={() => { toggleWishlist(product.id); toast.success(inWishlist ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích"); }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-soft backdrop-blur transition hover:bg-background"
      >
        <Heart className={`h-4 w-4 ${inWishlist ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>
      <div className="space-y-2 p-4">
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-snug hover:text-primary">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {product.rating ?? 5} · Đã bán {Math.floor(Math.random() * 200) + 10}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-lg font-bold text-primary">{formatVND(product.price)}</div>
            {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{formatVND(product.oldPrice)}</div>}
          </div>
          <Button size="sm" onClick={() => { addToCart(product.id); toast.success("Đã thêm vào giỏ"); }}>Mua</Button>
        </div>
      </div>
    </div>
  );
}
