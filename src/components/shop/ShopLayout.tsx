import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Heart, User as UserIcon, LogOut, Search, LayoutDashboard } from "lucide-react";
import { useStore, useCurrentUser } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ShopHeader() {
  const user = useCurrentUser();
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const logout = useStore((s) => s.logout);
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container mx-auto flex items-center gap-6 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
            <span className="font-display text-lg font-bold">M</span>
          </div>
          <span className="font-display text-xl font-bold">MaiShop</span>
        </Link>

        <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm, danh mục..." className="pl-10" />
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Trang chủ</Link>
          <Link to="/products" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Sản phẩm</Link>
          <Link to="/reviews" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Đánh giá</Link>
          {user && <Link to="/orders" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Đơn hàng</Link>}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user && (
            <Link to="/wishlist" className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{wishlist.length}</span>}
            </Link>
          )}
          <Link to="/cart" className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              {(user.role === "admin" || user.role === "staff") && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin"><LayoutDashboard className="mr-1 h-4 w-4" />Quản trị</Link>
                </Button>
              )}
              <Link to="/profile" className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent sm:flex">
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </Link>
              <Button size="icon" variant="ghost" onClick={logout} title="Đăng xuất"><LogOut className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button asChild size="sm" className="ml-2"><Link to="/login">Đăng nhập</Link></Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function ShopFooter() {
  return (
    <footer className="mt-16 border-t bg-secondary/40">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><span className="font-display font-bold">M</span></div>
            <span className="font-display text-lg font-bold">MaiShop</span>
          </div>
          <p className="text-sm text-muted-foreground">Hệ thống quản lý thương mại điện tử dành cho doanh nghiệp vừa và nhỏ.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Chính sách đổi trả</li><li>Vận chuyển</li><li>Thanh toán</li><li>Liên hệ</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Giới thiệu</li><li>Tuyển dụng</li><li>Tin tức</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Liên hệ</h4>
          <p className="text-sm text-muted-foreground">Hotline: 1900 0000<br/>Email: hello@maishop.vn<br/>Hà Nội, Việt Nam</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 MaiShop. ECMS demo for SMEs.</div>
    </footer>
  );
}
