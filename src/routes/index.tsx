import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopHeader, ShopFooter } from "@/components/shop/ShopLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const featured = products.slice(0, 4);
  const newest = products.slice(-4).reverse();

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />

      {/* Hero */}
      <section className="bg-gradient-warm">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Mới ra mắt · Mùa lễ hội</span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-foreground text-balance md:text-6xl">
              Mua sắm <span className="text-primary">thông minh</span> cho doanh nghiệp & gia đình
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Hệ thống thương mại điện tử hiện đại — sản phẩm chính hãng, vận chuyển nhanh, hỗ trợ tận tâm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/products">Khám phá sản phẩm <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/login">Đăng nhập admin</Link></Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
              <div><div className="font-display text-2xl font-bold text-primary">10K+</div><div className="text-xs text-muted-foreground">Khách hàng</div></div>
              <div><div className="font-display text-2xl font-bold text-primary">500+</div><div className="text-xs text-muted-foreground">Sản phẩm</div></div>
              <div><div className="font-display text-2xl font-bold text-primary">4.9★</div><div className="text-xs text-muted-foreground">Đánh giá</div></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80" alt="Shopping" className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-elevated" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="24">Ảnh</text></svg>')}`; }} />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y bg-card">
        <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, t: "Giao hàng nhanh", d: "Toàn quốc 1-3 ngày" },
            { icon: ShieldCheck, t: "Chính hãng 100%", d: "Cam kết chất lượng" },
            { icon: RotateCcw, t: "Đổi trả 7 ngày", d: "Miễn phí đổi trả" },
            { icon: Headphones, t: "Hỗ trợ 24/7", d: "Tư vấn tận tâm" },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
              <div><div className="font-semibold">{f.t}</div><div className="text-xs text-muted-foreground">{f.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Danh mục nổi bật</h2>
            <p className="text-muted-foreground">Khám phá theo từng nhóm sản phẩm</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link key={c.id} to="/products" search={{ category: c.id } as never} className="group relative overflow-hidden rounded-2xl bg-gradient-warm p-6 shadow-soft transition hover:shadow-elevated">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">#{i + 1}</div>
              <div className="mt-2 font-display text-xl font-bold">{c.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
              <ArrowRight className="mt-4 h-5 w-5 text-primary transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold">Sản phẩm bán chạy</h2>
          <Button asChild variant="ghost"><Link to="/products">Xem tất cả <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Newest */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="mb-6 font-display text-3xl font-bold">Hàng mới về</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <ShopFooter />
    </div>
  );
}
