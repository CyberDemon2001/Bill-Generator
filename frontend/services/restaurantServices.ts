import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL_MOBILE;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginRestaurant = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/restaurants/login`, {
      email,
      password,
    });

    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }
    return { ...response.data, success: true };
  } catch (error: any) {
    // Capture backend error response
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        message: error.response.data?.message || "Something went wrong",
      };
    }

    // Network or unknown error
    return {
      success: false,
      status: 0,
      message: "Couldn't connect to the server. Please check your internet connection.",
    };
  }
};


export const createRestaurant = async (
  restaurantName: string,
  address: string,
  phone: string,
  email: string,
  password: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/restaurants/create`, {
      restaurantName,
        address,
        phone,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error signing up restaurant:", error);
    throw error;
  }
};

export const updateRestaurant = async (
  restaurantName: string,
  address: string,
  phone: string,
) => {
  try {
    const response = await api.put("/restaurants/update", {
      restaurantName,
      address,
      phone,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

export const getRestaurantProfile = async () => {
  try {
    const response = await api.get("/restaurants");
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    throw error;
  }
};

export const logoutRestaurant = async () => {
  try {
    const response = await api.post("/restaurants/logout",);
    return response.data;
  } catch (error) {
    console.error("Error logging out restaurant:", error);
    throw error;
  }
};
