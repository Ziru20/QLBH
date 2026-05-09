export type Role = "admin" | "staff" | "customer";

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string;
  description: string;
  rating?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  paymentMethod: "cod" | "bank";
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  expiresAt: string;
  active: boolean;
}
