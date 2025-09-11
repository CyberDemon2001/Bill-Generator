import axios from "axios";

// Base API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL_MOBILE;

// Axios instance configured to send cookies automatically
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ sends cookies automatically
});

// ----------------- Type Definitions -----------------

export interface PriceOption {
  _id?: string;      // Optional ID before saving
  size: string;
  amount: number;
}

export interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: PriceOption[];
}

export interface MenuCategory {
  _id?: string;
  name: string;
  items: MenuItem[];
}

// ----------------- Menu Service Functions -----------------

/**
 * Fetch all menu categories
 */
export const getMenu = async (): Promise<MenuCategory[]> => {
  const response = await api.get("/menu");
  return response.data.categories || [];
};


/**
 * Create a new menu category or add items to an existing category
 */
export const createMenu = async (
  data: { categories: MenuCategory[] }
): Promise<MenuCategory[]> => {
  const response = await api.post("/menu", data);
  return response.data.categories;
};



/**
 * Update a menu category (e.g., name)
 */
export const updateMenuCategory = async (
  categoryId: string,
  updateData: Partial<Omit<MenuCategory, "_id">>
): Promise<MenuCategory> => {
  const response = await api.put(`/menu/${categoryId}`, updateData);
  return response.data;
};

/**
 * Update a menu item inside a category
 */
export const updateMenuItem = async (
  categoryId: string,
  itemId: string,
  itemData: Partial<MenuItem>
): Promise<MenuCategory> => {
  const response = await api.put(`/menu/${categoryId}/items/${itemId}`, itemData);
  return response.data.category;
};

/**
 * Delete an entire menu category
 */
export const deleteMenuCategory = async (
  categoryId: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/menu/${categoryId}`);
  return response.data;
};

/**
 * Delete a single menu item from a category
 */
export const deleteMenuItem = async (
  categoryId: string,
  itemId: string
): Promise<MenuCategory> => {
  const response = await api.delete(`/menu/${categoryId}/items/${itemId}`);
  return response.data.category;
};
