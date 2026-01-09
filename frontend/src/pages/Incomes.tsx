import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionDialog } from "@/components/dialogs/TransactionDialog";
import { EditTransactionDialog } from "@/components/dialogs/EditTransactionDialog";
import { useTransactions, useDeleteTransaction, Transaction } from "@/hooks/useTransactions";
import { usePreferences } from "@/contexts/PreferencesContext";

const recurrenceLabels: Record<string, { pt: string; en: string }> = {
  none: { pt: "", en: "" },
  daily: { pt: "Diária", en: "Daily" },
  weekly: { pt: "Semanal", en: "Weekly" },
  monthly: { pt: "Mensal", en: "Monthly" },
  yearly: { pt: "Anual", en: "Yearly" },
};

export default function Incomes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { data: transactions, isLoading } = useTransactions("income");
  const deleteTransaction = useDeleteTransaction();
  const { t, language, formatCurrency } = usePreferences();

  const incomes = transactions || [];
  const filteredIncomes = incomes.filter((income) =>
    income.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const recurringCount = incomes.filter((i) => i.recurrence && i.recurrence !== "none").length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
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
          <h1 className="text-3xl font-display font-bold text-foreground">{t("incomes")}</h1>
          <p className="text-muted-foreground mt-1">
            {language === "en" ? "Manage your income sources" : "Gerencie suas fontes de renda"}
          </p>
        </div>

        <TransactionDialog type="income" />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-income/20 bg-gradient-to-br from-income/10 to-income/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-income/20">
                  <TrendingUp className="w-6 h-6 text-income" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Total This Month" : "Total do Mês"}
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Repeat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Recurring Income" : "Receitas Recorrentes"}
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {recurringCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/20">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Transactions" : "Transações"}
                  </p>
                  <p className="text-2xl font-display font-bold text-foreground">{incomes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search incomes..." : "Buscar receitas..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {t("filter")}
        </Button>
      </motion.div>

      {/* Incomes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display">
              {language === "en" ? "Income List" : "Lista de Receitas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncomes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("account")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.map((income, index) => (
                    <motion.tr
                      key={income.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{income.description || (language === "en" ? "No description" : "Sem descrição")}</span>
                          {income.recurrence && income.recurrence !== "none" && (
                            <Badge variant="secondary" className="text-xs">
                              <Repeat className="w-3 h-3 mr-1" />
                              {recurrenceLabels[income.recurrence]?.[language] || income.recurrence}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(income.categories as any)?.name || (language === "en" ? "No category" : "Sem categoria")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {(income.accounts as any)?.name || (language === "en" ? "No account" : "Sem conta")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(income.date).toLocaleDateString(language === "en" ? "en-US" : "pt-BR")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-income">
                        +{formatCurrency(income.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => setEditingTransaction(income as Transaction)}
                            >
                              <Pencil className="w-4 h-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => deleteTransaction.mutate(income.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No incomes found." : "Nenhuma receita encontrada."}
                  <br />
                  {language === "en" ? 'Click "New Income" to add one.' : 'Clique em "Nova Receita" para adicionar.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
