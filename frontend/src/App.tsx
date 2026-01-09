import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Incomes from "./pages/Incomes";
import Expenses from "./pages/Expenses";
import Transfers from "./pages/Transfers";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <ProtectedRoute>
                  <PreferencesProvider>
                    <AppLayout />
                  </PreferencesProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/incomes" element={<Incomes />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
