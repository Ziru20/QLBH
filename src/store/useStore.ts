import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Category, Order, OrderStatus, Product, Review, User, Voucher } from "./types";
import { seedCategories, seedProducts, seedReviews, seedUsers, seedVouchers } from "./seed";

interface AppState {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  vouchers: Voucher[];
  reviews: Review[];
  cart: CartItem[];
  wishlist: string[];
  currentUserId: string | null;

  // auth
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: Omit<User, "id" | "role" | "createdAt"> & { role?: User["role"] }) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  // categories
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // products
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // cart
  addToCart: (productId: string, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // wishlist
  toggleWishlist: (productId: string) => void;

  // orders
  placeOrder: (data: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // customers (admin CRUD on users with role=customer)
  addUser: (u: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // vouchers
  addVoucher: (v: Omit<Voucher, "id">) => void;
  updateVoucher: (id: string, v: Partial<Voucher>) => void;
  deleteVoucher: (id: string) => void;

  // reviews
  addReview: (r: Omit<Review, "id" | "createdAt">) => Promise<Review | void>;
  deleteReview: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // start empty so we adopt server-side IDs on app init
      users: [],
      categories: [],
      products: [],
      orders: [],
      vouchers: [],
      reviews: [],
      cart: [],
      wishlist: [],
      currentUserId: null,

      login: async (email, password) => {
        try {
          const res = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
          if (!res.ok) return null;
          const u = await res.json();
          set((s) => ({ users: s.users.some(x => x.id === u.id) ? s.users : [...s.users, u], currentUserId: u.id }));
          return u;
        } catch (e) { console.error(e); return null; }
      },

      register: async (data) => {
        try {
          const res = await fetch('http://localhost:4000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('register failed');
          const u = await res.json();
          set((s) => ({ users: [...s.users, u], currentUserId: u.id }));
          return u as User;
        } catch (e) {
          console.error(e);
          return null;
        }
      },

      logout: () => set({ currentUserId: null }),
      updateProfile: (data) => set((s) => ({
        users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...data } : u)),
      })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, c) => set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((x) => x.id !== id) })),

      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid(), createdAt: new Date().toISOString() }] })),
      updateProduct: (id, p) => set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      addToCart: (productId, qty = 1) => set((s) => {
        const existing = s.cart.find((c) => c.productId === productId);
        if (existing) return { cart: s.cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + qty } : c)) };
        return { cart: [...s.cart, { productId, quantity: qty }] };
      }),
      updateCartQty: (productId, qty) => set((s) => ({
        cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
      })),
      removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
      clearCart: () => set({ cart: [] }),

      toggleWishlist: (productId) => set((s) => ({
        wishlist: s.wishlist.includes(productId) ? s.wishlist.filter((x) => x !== productId) : [...s.wishlist, productId],
      })),

      placeOrder: async (data) => {
        try {
          const res = await fetch('http://localhost:4000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('order failed');
          const body = await res.json();
          const order: Order = { ...data, id: body.orderId, status: 'pending', createdAt: new Date().toISOString() } as any;
          set((s) => ({ orders: [order, ...s.orders], products: s.products.map((p) => {
            const item = order.items.find((i) => i.productId === p.id);
            return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
          }) }));
          return order;
        } catch (e) { console.error(e); throw e; }
      },
      updateOrderStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      addUser: (u) => set((s) => ({ users: [...s.users, { ...u, id: uid(), createdAt: new Date().toISOString() }] })),
      updateUser: (id, u) => set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, ...u } : x)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),

      addVoucher: (v) => set((s) => ({ vouchers: [...s.vouchers, { ...v, id: uid() }] })),
      updateVoucher: (id, v) => set((s) => ({ vouchers: s.vouchers.map((x) => (x.id === id ? { ...x, ...v } : x)) })),
      deleteVoucher: (id) => set((s) => ({ vouchers: s.vouchers.filter((x) => x.id !== id) })),

      addReview: async (r) => {
        try {
          const res = await fetch('http://localhost:4000/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
          if (!res.ok) throw new Error('review failed');
          const rr = await res.json();
          set((s) => ({ reviews: [rr, ...s.reviews] }));
          return rr as Review;
        } catch (e) { console.error(e); }
      },
      deleteReview: (id) => set((s) => ({ reviews: s.reviews.filter((x) => x.id !== id) })),
    }),
    { name: "ecms-store" }
  )
);

export const useCurrentUser = () => {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
};
