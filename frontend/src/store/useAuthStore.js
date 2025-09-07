import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  onlineUsers: [],
  socket: null,

  // ✅ Loading states
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // ✅ Check current user
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });

      get().coonnectSocket();
    } catch (error) {
      set({ authUser: null });
      toast.error(
        error.response.data.message || "Session expired, please login again"
      );
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account created successfully 🎉");

      get().coonnectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Signup failed";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");

      get().coonnectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
      set({ authUser: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully 👋");

      get().discoonnectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Logout failed";
      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      console.log("UPDATED DATA: ", res.data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error?.response?.data?.message || "Update failed";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  coonnectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  discoonnectSocket: () => {
    if (get().socket.connected) get().socket.disconnect();
  },
}));
