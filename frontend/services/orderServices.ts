import axios from "axios";

// Base API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL_RENDER;

// Axios instance configured to send cookies automatically
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ sends cookies automatically
});

// ----------------- Type Definitions -----------------

export interface OrderItem {
  menuItemId: string;
  categoryId?: string;
  name?: string; // optional, mainly returned from server
  size: string;
  quantity: number;
  price?: number;
  total?: number;
}

export interface Order {
  _id: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: "cash" | "card" | "upi";
}

export interface CreateOrderPayload {
  customerName: string;
  paymentMethod?: "cash" | "card" | "upi";
  items: OrderItem[];
}

// ----------------- Order Service Functions -----------------

/**
 * Fetch all orders (optionally filtered by date and/or restaurantId)
 */
export const getOrders = async (
  date?: Date | null,
  restaurantId?: string
): Promise<Order[]> => {
  const params: Record<string, string> = {};

  if (date) params.date = date.toISOString().split("T")[0];
  if (restaurantId) params.restaurantId = restaurantId;

  const response = await api.get("/orders", { params });
  return response.data;
};

/**
 * Create a new order
 */
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<Order> => {
  const response = await api.post("/orders", payload);
  return response.data;
};

/**
 * Fetch a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};
