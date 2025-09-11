import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL_RENDER;

export const loginRestaurant = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/restaurants/login`, {
      email,
      password,
    });
    return { success: true, data: response.data };
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
    const response = await axios.put(`${API_BASE_URL}/restaurants/update`, {
      restaurantName,
      address,
      phone,
    }, {
      withCredentials: true, // ensure cookies/token are sent
    });

    return response.data;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

export const getRestaurantProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants/`, {
      withCredentials: true, // ensure cookies/token are sent
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    throw error;
  }
};

export const logoutRestaurant = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/restaurants/logout`, {}, {
      withCredentials: true, // ensure cookies/token are sent
    });
    return response.data;
  } catch (error) {
    console.error("Error logging out restaurant:", error);
    throw error;
  }
};
