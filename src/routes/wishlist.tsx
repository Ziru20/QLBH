import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { useStore } from "@/store/useStore";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const products = useStore((s) => s.products.filter((p) => s.wishlist.includes(p.id)));

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Sản phẩm yêu thích</h1>
        {wishlist.length === 0 ? (
          <div className="rounded-xl border bg-card py-20 text-center text-muted-foreground">
            Chưa có sản phẩm yêu thích. <Link to="/products" className="text-primary underline">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <ShopFooter />
    </div>
  );
}
