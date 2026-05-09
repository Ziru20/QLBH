import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MaiShop ECMS — Hệ thống quản lý TMĐT cho SMEs" },
      { name: "description", content: "Nền tảng thương mại điện tử & quản trị toàn diện dành cho doanh nghiệp vừa và nhỏ." },
      { name: "author", content: "MaiShop" },
      { property: "og:title", content: "MaiShop ECMS — Hệ thống quản lý TMĐT cho SMEs" },
      { property: "og:description", content: "Nền tảng thương mại điện tử & quản trị toàn diện dành cho doanh nghiệp vừa và nhỏ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const setFromApi = useStore((s) => s);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = 'http://localhost:4000/api';
        const [prodR, catR, vouR, revR, usersR] = await Promise.all([
          fetch(base + '/products'),
          fetch(base + '/categories'),
          fetch(base + '/vouchers'),
          fetch(base + '/reviews'),
          fetch(base + '/users'),
        ]);
        if (!mounted) return;
        if (prodR.ok && catR.ok && vouR.ok && revR.ok && usersR.ok) {
          const [products, categories, vouchers, reviews, users] = await Promise.all([prodR.json(), catR.json(), vouR.json(), revR.json(), usersR.json()]);
          // Replace canonical data (products/categories/vouchers/reviews/users) from server
          // but preserve session-specific state like cart, wishlist and currentUserId
          const cur = useStore.getState();
          useStore.setState({
            products,
            categories,
            vouchers,
            reviews,
            users,
            cart: cur.cart,
            wishlist: cur.wishlist,
            currentUserId: cur.currentUserId,
            orders: cur.orders,
          });
        }
      } catch (e) {
        console.debug('API init skipped', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return <Outlet />;
}
