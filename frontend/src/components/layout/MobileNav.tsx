import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Wallet,
  Tags,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, labelKey: "dashboard", path: "/" },
  { icon: TrendingUp, labelKey: "incomes", path: "/incomes" },
  { icon: TrendingDown, labelKey: "expenses", path: "/expenses" },
  { icon: ArrowLeftRight, labelKey: "transfers", path: "/transfers" },
  { icon: Wallet, labelKey: "accounts", path: "/accounts" },
  { icon: Tags, labelKey: "categories", path: "/categories" },
  { icon: FileText, labelKey: "reports", path: "/reports" },
  { icon: Settings, labelKey: "settings", path: "/settings" },
];

interface MobileNavProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MobileNav({ isDarkMode, onToggleDarkMode }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = usePreferences();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-lg border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">My Finance</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 z-50 w-72 bg-sidebar border-l border-sidebar-border p-4"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  const label = t(item.labelKey as any);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <Button
                  variant="ghost"
                  onClick={onToggleDarkMode}
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{isDarkMode ? t("lightMode") : t("darkMode")}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t("logout")}</span>
                </Button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
