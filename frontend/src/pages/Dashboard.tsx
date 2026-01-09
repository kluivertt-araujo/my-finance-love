import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Scale, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AccountsOverview } from "@/components/dashboard/AccountsOverview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard, getPeriodDates } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { t, formatCurrency, language } = usePreferences();
  const [period, setPeriod] = useState("1month");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { startDate, endDate } = useMemo(() => getPeriodDates(period), [period]);
  const dateLocale = language === "pt" ? ptBR : enUS;

  const {
    accounts,
    categories,
    totalBalance,
    totalIncome,
    totalExpense,
    balance,
    monthlyData,
    expenseCategoryData,
    recentTransactions,
    isLoading,
  } = useDashboard({
    startDate,
    endDate,
    accountId: accountFilter !== "all" ? accountFilter : undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const periodLabel = useMemo(() => {
    switch (period) {
      case "1month":
        return format(new Date(), "MMMM yyyy", { locale: dateLocale });
      case "3months":
        return t("last3Months");
      case "6months":
        return t("last6Months");
      case "1year":
        return t("lastYear");
      default:
        return format(new Date(), "MMMM yyyy", { locale: dateLocale });
    }
  }, [period, dateLocale, t]);

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="xl:col-span-2 h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t("hello")}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("financeSummary")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t("thisMonth")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">{t("thisMonth")}</SelectItem>
              <SelectItem value="3months">{t("last3Months")}</SelectItem>
              <SelectItem value="6months">{t("last6Months")}</SelectItem>
              <SelectItem value="1year">{t("lastYear")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("allAccounts")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allAccounts")}</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title={t("totalBalance")}
          value={formatCurrency(totalBalance)}
          icon={<Wallet className="w-6 h-6" />}
          variant="balance"
          delay={0}
        />
        <StatCard
          title={t("incomes")}
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="income"
          delay={0.1}
        />
        <StatCard
          title={t("expenses")}
          value={formatCurrency(totalExpense)}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="expense"
          delay={0.2}
        />
        <StatCard
          title={t("balance")}
          value={formatCurrency(balance)}
          icon={<Scale className="w-6 h-6" />}
          variant="default"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <OverviewChart data={monthlyData} />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CategoryChart type="expense" data={expenseCategoryData} />
        </div>
      </div>

      {/* Transactions and Accounts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentTransactions transactions={recentTransactions} />
        <AccountsOverview accounts={accounts || []} />
      </div>
    </div>
  );
}
