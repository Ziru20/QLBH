import { createFileRoute } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { useStore } from "@/store/useStore";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Product } from "@/store/types";

interface ProductsSearch { q?: string; category?: string }

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): ProductsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState(search.category ?? "");
  const [sort, setSort] = useState<"new" | "asc" | "desc">("new");

  const [localProducts, setLocalProducts] = useState<Product[] | null>(null);

  const effectiveProducts = products.length ? products : (localProducts ?? []);

  const filtered = useMemo(() => {
    let list = effectiveProducts;
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (cat) list = list.filter((p) => p.categoryId === cat);
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, q, cat, sort]);

  useEffect(() => {
    if (products.length === 0) {
      (async () => {
        try {
          const res = await fetch('http://localhost:4000/api/products');
          if (!res.ok) return;
          const list = await res.json();
          setLocalProducts(list);
        } catch (e) {
          console.debug('Products fetch failed', e);
        }
      })();
    }
  }, [products.length]);

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <div className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Tất cả sản phẩm</h1>
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm..." className="pl-10" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as "new" | "asc" | "desc")} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="new">Mới nhất</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-card py-20 text-center text-muted-foreground">Không có sản phẩm phù hợp.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <ShopFooter />
    </div>
  );
}
