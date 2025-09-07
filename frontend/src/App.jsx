import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Framer Motion
import { AnimatePresence, motion } from "framer-motion";
import { useThemeStore } from "./store/useThemeStore";

function App() {
  const location = useLocation();
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("AUTHUSERRRRRRR: ", onlineUsers);

  if (isCheckingAuth && authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              authUser ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <HomePage />
                </motion.div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !authUser ? (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <SignupPage />
                </motion.div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/login"
            element={
              !authUser ? (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4 }}
                >
                  <LoginPage />
                </motion.div>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="/settings" element={<SettingsPage />} />

          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </AnimatePresence>

      <Toaster position="top-left" reverseOrder={false} />
    </div>
  );
}

export default App;
