import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useDashboard, getPeriodDates } from "@/hooks/useDashboard";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Reports() {
  const [period, setPeriod] = useState("6months");
  const [reportType, setReportType] = useState("complete");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { t, language, formatCurrency } = usePreferences();
  const { startDate, endDate } = useMemo(() => getPeriodDates(period), [period]);

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    monthlyData,
    expenseCategoryData,
    isLoading,
  } = useDashboard({
    startDate,
    endDate,
    accountId: accountFilter !== "all" ? accountFilter : undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  // Filter transactions based on reportType
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    switch (reportType) {
      case "income":
        return transactions.filter((t) => t.type === "income");
      case "expense":
        return transactions.filter((t) => t.type === "expense");
      default:
        return transactions;
    }
  }, [transactions, reportType]);

  // Calculate balance evolution
  const balanceData = useMemo(() => {
    let runningBalance = 0;
    return monthlyData.map((m) => {
      runningBalance += m.saldo;
      return {
        month: m.month,
        saldo: runningBalance,
      };
    });
  }, [monthlyData]);

  const handleExport = (format: "xlsx" | "csv") => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }

    const exportData = filteredTransactions.map((tr) => ({
      [language === "en" ? "Date" : "Data"]: new Date(tr.date).toLocaleDateString(language === "en" ? "en-US" : "pt-BR"),
      [language === "en" ? "Type" : "Tipo"]: tr.type === "income" ? (language === "en" ? "Income" : "Receita") : (language === "en" ? "Expense" : "Despesa"),
      [language === "en" ? "Description" : "Descrição"]: tr.description || "",
      [language === "en" ? "Category" : "Categoria"]: (tr as any).categories?.name || (language === "en" ? "No category" : "Sem categoria"),
      [language === "en" ? "Amount" : "Valor"]: Number(tr.amount).toFixed(2),
      [language === "en" ? "Notes" : "Notas"]: tr.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, language === "en" ? "Report" : "Relatório");

    worksheet["!cols"] = [
      { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 30 },
    ];

    const fileName = `${language === "en" ? "financial_report" : "relatorio_financeiro"}_${new Date().toISOString().split("T")[0]}`;

    if (format === "xlsx") {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: "csv" });
    }

    toast.success(`${t("reportExported")} ${format.toUpperCase()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-10 w-[180px]" />))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-24" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t("reportsTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("detailedAnalysis")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => handleExport("xlsx")}>
            <FileSpreadsheet className="w-4 h-4" />{t("exportExcel")}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport("csv")}>
            <Download className="w-4 h-4" />{t("exportCsv")}
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]"><Calendar className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">{t("lastMonth")}</SelectItem>
            <SelectItem value="3months">{t("last3Months")}</SelectItem>
            <SelectItem value="6months">{t("last6Months")}</SelectItem>
            <SelectItem value="1year">{t("lastYear")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]"><FileText className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">{t("complete")}</SelectItem>
            <SelectItem value="income">{t("onlyIncomes")}</SelectItem>
            <SelectItem value="expense">{t("onlyExpenses")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("allAccounts")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allAccounts")}</SelectItem>
            {accounts?.map((account) => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("allCategories")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories?.map((category) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-income/20 bg-gradient-to-br from-income/10 to-income/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{t("totalIncomes")}</p>
              <p className="text-2xl font-display font-bold text-income">+{formatCurrency(totalIncome)}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-expense/20 bg-gradient-to-br from-expense/10 to-expense/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{t("totalExpenses")}</p>
              <p className="text-2xl font-display font-bold text-expense">-{formatCurrency(totalExpense)}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{t("periodBalance")}</p>
              <p className={`text-2xl font-display font-bold ${balance >= 0 ? "text-income" : "text-expense"}`}>
                {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50">
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />{t("monthlyComparison")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.some((m) => m.receitas > 0 || m.despesas > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                      <Bar dataKey="receitas" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} name={t("incomes")} />
                      <Bar dataKey="despesas" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} name={t("expenses")} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-muted-foreground">{t("noDataInPeriod")}</div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50">
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><PieChart className="w-5 h-5 text-secondary" />{t("expensesByCategory")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                {expenseCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {expenseCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (<div className="w-full h-full flex items-center justify-center text-muted-foreground">{t("noExpensesInPeriod")}</div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="xl:col-span-2">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><TrendingUp className="w-5 h-5 text-income" />{t("balanceEvolution")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {balanceData.some((b) => b.saldo !== 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                      <Line type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-muted-foreground">{t("noDataInPeriod")}</div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
