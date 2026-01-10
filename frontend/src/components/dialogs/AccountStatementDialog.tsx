import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Account } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useTransfers } from "@/hooks/useTransfers";
import { useAccountContributions } from "@/hooks/useGoals";
import { usePreferences } from "@/contexts/PreferencesContext";
import { TrendingUp, TrendingDown, ArrowLeftRight, Minus, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

interface AccountStatementDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterType = "all" | "income" | "expense" | "transfer" | "contribution";

interface StatementEntry {
  id: string;
  date: string;
  description: string;
  type: "income" | "expense" | "transfer_in" | "transfer_out" | "contribution";
  amount: number;
  category?: string;
  goalName?: string;
}

export function AccountStatementDialog({ account, open, onOpenChange }: AccountStatementDialogProps) {
  const { language, formatCurrency } = usePreferences();
  const { data: transactions } = useTransactions();
  const { data: transfers } = useTransfers();
  const { data: contributions } = useAccountContributions(account.id);

  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const [filterType, setFilterType] = useState<FilterType>("all");

  const entries = useMemo(() => {
    const result: StatementEntry[] = [];

    // Add transactions for this account
    transactions
      ?.filter((t) => t.account_id === account.id)
      .forEach((t) => {
        result.push({
          id: t.id,
          date: t.date,
          description: t.description || (t.type === "income" ? "Receita" : "Despesa"),
          type: t.type,
          amount: t.amount,
          category: (t.categories as any)?.name,
        });
      });

    // Add transfers involving this account
    transfers?.forEach((t) => {
      if (t.from_account_id === account.id) {
        result.push({
          id: `transfer-out-${t.id}`,
          date: t.date,
          description: t.description || `Transferência para ${(t.to_account as any)?.name || "conta"}`,
          type: "transfer_out",
          amount: t.amount,
        });
      }
      if (t.to_account_id === account.id) {
        result.push({
          id: `transfer-in-${t.id}`,
          date: t.date,
          description: t.description || `Transferência de ${(t.from_account as any)?.name || "conta"}`,
          type: "transfer_in",
          amount: t.amount,
        });
      }
    });

    // Add goal contributions from this account
    contributions?.forEach((c) => {
      result.push({
        id: `contribution-${c.id}`,
        date: c.date,
        description: language === "en" 
          ? `Goal contribution: ${c.goal?.name || "Goal"}` 
          : `Aporte para Meta: ${c.goal?.name || "Meta"}`,
        type: "contribution",
        amount: c.amount,
        goalName: c.goal?.name,
      });
    });

    // Filter by date
    const filtered = result.filter((entry) => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });

    // Filter by type
    const typeFiltered = filtered.filter((entry) => {
      if (filterType === "all") return true;
      if (filterType === "income") return entry.type === "income";
      if (filterType === "expense") return entry.type === "expense";
      if (filterType === "transfer") return entry.type === "transfer_in" || entry.type === "transfer_out";
      if (filterType === "contribution") return entry.type === "contribution";
      return true;
    });

    // Sort by date descending
    return typeFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, transfers, contributions, account.id, startDate, endDate, filterType, language]);

  const summary = useMemo(() => {
    let credits = 0;
    let debits = 0;

    entries.forEach((entry) => {
      if (entry.type === "income" || entry.type === "transfer_in") {
        credits += entry.amount;
      } else {
        debits += entry.amount;
      }
    });

    return { credits, debits, balance: credits - debits };
  }, [entries]);

  const getEntryIcon = (type: StatementEntry["type"]) => {
    switch (type) {
      case "income":
        return <TrendingUp className="w-4 h-4 text-income" />;
      case "expense":
        return <TrendingDown className="w-4 h-4 text-expense" />;
      case "transfer_in":
      case "transfer_out":
        return <ArrowLeftRight className="w-4 h-4 text-secondary" />;
      case "contribution":
        return <Target className="w-4 h-4 text-primary" />;
    }
  };

  const getEntryColor = (type: StatementEntry["type"]) => {
    switch (type) {
      case "income":
      case "transfer_in":
        return "text-income";
      case "expense":
      case "transfer_out":
      case "contribution":
        return "text-expense";
    }
  };

  const dateLocale = language === "en" ? enUS : ptBR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">
            {language === "en" ? "Account Statement" : "Extrato da Conta"} - {account.name}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
          <div className="space-y-1.5">
            <Label className="text-xs">{language === "en" ? "From" : "De"}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{language === "en" ? "To" : "Até"}</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs">{language === "en" ? "Type" : "Tipo"}</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All" : "Todos"}</SelectItem>
                <SelectItem value="income">{language === "en" ? "Income" : "Receitas"}</SelectItem>
                <SelectItem value="expense">{language === "en" ? "Expense" : "Despesas"}</SelectItem>
                <SelectItem value="transfer">{language === "en" ? "Transfers" : "Transferências"}</SelectItem>
                <SelectItem value="contribution">{language === "en" ? "Goal Contributions" : "Aportes p/ Metas"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{language === "en" ? "Credits" : "Créditos"}</p>
            <p className="text-lg font-semibold text-income">{formatCurrency(summary.credits)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{language === "en" ? "Debits" : "Débitos"}</p>
            <p className="text-lg font-semibold text-expense">{formatCurrency(summary.debits)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{language === "en" ? "Balance" : "Saldo"}</p>
            <p className={`text-lg font-semibold ${summary.balance >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Entries List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-4">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      {getEntryIcon(entry.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{entry.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(entry.date), "dd MMM yyyy", { locale: dateLocale })}
                        </span>
                        {entry.category && (
                          <>
                            <Minus className="w-3 h-3" />
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {entry.category}
                            </Badge>
                          </>
                        )}
                        {entry.type === "contribution" && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                            {language === "en" ? "Goal" : "Meta"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`font-semibold ${getEntryColor(entry.type)}`}>
                    {entry.type === "income" || entry.type === "transfer_in" ? "+" : "-"}
                    {formatCurrency(entry.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {language === "en" ? "No transactions found for this period." : "Nenhuma transação encontrada para este período."}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
