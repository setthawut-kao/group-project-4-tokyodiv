import api from "@/lib/axios";

export const authSignIn = async (params = {}) => {
  try {
    const response = await api.post("/api/auth/signin", params);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
