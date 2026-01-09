import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  accountId?: string;
  categoryId?: string;
}

export interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export function useDashboard(filters: DashboardFilters) {
  const { user } = useAuth();

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["dashboard-accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["dashboard-transactions", user?.id, filters.startDate, filters.endDate, filters.accountId, filters.categoryId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("transactions")
        .select("*, categories(name, color)")
        .gte("date", format(filters.startDate, "yyyy-MM-dd"))
        .lte("date", format(filters.endDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (filters.accountId) {
        query = query.eq("account_id", filters.accountId);
      }
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ["dashboard-categories", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate totals
  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
  
  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalExpense = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = totalIncome - totalExpense;

  // Calculate monthly data for charts (last 6 months)
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, "MMM", { locale: ptBR });

    const monthTransactions = transactions?.filter((t) => {
      const date = parseISO(t.date);
      return date >= monthStart && date <= monthEnd;
    }) || [];

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyData.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      receitas: income,
      despesas: expense,
      saldo: income - expense,
    });
  }

  // Calculate category data for pie chart
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const expenseCategoryData: CategoryData[] = [];
  const incomeCategoryData: CategoryData[] = [];

  transactions?.forEach((t) => {
    const categoryName = t.categories?.name || "Sem categoria";
    const categoryColor = t.categories?.color || "#6366f1";
    
    if (t.type === "expense") {
      const existing = expenseCategoryData.find((c) => c.name === categoryName);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        expenseCategoryData.push({
          name: categoryName,
          value: Number(t.amount),
          color: categoryColor,
        });
      }
    } else {
      const existing = incomeCategoryData.find((c) => c.name === categoryName);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        incomeCategoryData.push({
          name: categoryName,
          value: Number(t.amount),
          color: categoryColor,
        });
      }
    }
  });

  // Sort by value and assign chart colors
  expenseCategoryData.sort((a, b) => b.value - a.value);
  incomeCategoryData.sort((a, b) => b.value - a.value);

  expenseCategoryData.forEach((c, i) => {
    c.color = chartColors[i % chartColors.length];
  });
  incomeCategoryData.forEach((c, i) => {
    c.color = chartColors[i % chartColors.length];
  });

  // Recent transactions (last 6)
  const recentTransactions = transactions?.slice(0, 6) || [];

  return {
    accounts,
    categories,
    transactions,
    totalBalance,
    totalIncome,
    totalExpense,
    balance,
    monthlyData,
    expenseCategoryData,
    incomeCategoryData,
    recentTransactions,
    isLoading: accountsLoading || transactionsLoading,
  };
}

// Helper to get period dates
export function getPeriodDates(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = endOfMonth(now);
  
  switch (period) {
    case "1month":
      return { startDate: startOfMonth(now), endDate };
    case "3months":
      return { startDate: startOfMonth(subMonths(now, 2)), endDate };
    case "6months":
      return { startDate: startOfMonth(subMonths(now, 5)), endDate };
    case "1year":
      return { startDate: startOfMonth(subMonths(now, 11)), endDate };
    default:
      return { startDate: startOfMonth(now), endDate };
  }
}
