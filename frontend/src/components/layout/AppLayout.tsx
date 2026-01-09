import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { motion } from "framer-motion";

export function AppLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </div>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="lg:ml-[280px] min-h-screen pt-16 lg:pt-0"
      >
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
