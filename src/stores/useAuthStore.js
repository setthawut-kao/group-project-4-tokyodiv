import { create } from "zustand";
import api from "@/lib/axios";
import { useCartStore } from "./useCartStore";
import { authSignIn } from "@/services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isAuthDialogOpen: false,
  postLoginAction: null,

  openAuthDialog: (action = null) =>
    set({ isAuthDialogOpen: true, postLoginAction: action }),

  closeAuthDialog: () =>
    set({ isAuthDialogOpen: false, postLoginAction: null }),

  checkAuthStatus: async () => {
    try {
      const response = await api.get("/api/auth/profile");
      set({ user: response.data, isLoggedIn: true });
      useCartStore.getState().fetchCart(); // เมื่อ Login อยู่ ให้ดึงข้อมูลตะกร้าทันที
    } catch (error) {
      console.error("Failed to check user status:", error);
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false }); // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้ตั้งค่า isLoading เป็น false เสมอ
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData); // ใช้ path สั้นๆ ได้เลย
      set({ user: response.data, isLoggedIn: true });

      // หลังจาก Register/Login สำเร็จ ให้ดึงข้อมูลตะกร้าจาก Server
      useCartStore.getState().fetchCart();

      const postAction = get().postLoginAction;
      if (postAction) {
        postAction(); //ทำสิ่งที่ค้างไว้
        get().closeAuthDialog();
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration failed:", error.response.data);
      return { success: false, message: error.response.data.message };
    }
  },

  login: async (userData) => {
    try {
      // const response = await api.post("/api/auth/signin", userData);
      const response = await authSignIn(userData);
      console.log("login", response.data);
      set({ user: response.data, isLoggedIn: true });

      // หลังจาก Register/Login สำเร็จ ให้ดึงข้อมูลตะกร้าจาก Server
      // useCartStore.getState().fetchCart();

      // const postAction = get().postLoginAction;
      // if (postAction) {
      //   postAction(); //ทำสิ่งที่ค้างไว้
      //   get().closeAuthDialog();
      // }
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Login failed:", error.response.data);
      return { success: false, message: error.response.data.message };
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
      set({ user: null, isLoggedIn: false });
      useCartStore.getState().clearCartLocal(); // เคลียร์ตะกร้าใน state ด้วย
    } catch (error) {
      console.error("Logout failed:", error);
      set({ user: null, isLoggedIn: false });
      useCartStore.getState().clearCartLocal();
    }
  },
}));
