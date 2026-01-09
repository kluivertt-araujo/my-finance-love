import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/components/dialogs/AccountDialog";
import { EditAccountDialog } from "@/components/dialogs/EditAccountDialog";
import { AccountStatementDialog } from "@/components/dialogs/AccountStatementDialog";
import { useAccounts, useDeleteAccount, Account } from "@/hooks/useAccounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/integrations/supabase/types";
import { usePreferences } from "@/contexts/PreferencesContext";

type AccountType = Database["public"]["Enums"]["account_type"];

const typeConfig: Record<AccountType, {
  icon: typeof Building2;
  gradient: string;
  bgLight: string;
  label: { pt: string; en: string };
}> = {
  checking: {
    icon: Building2,
    gradient: "from-primary to-primary/70",
    bgLight: "from-primary/20 to-primary/5",
    label: { pt: "Conta Corrente", en: "Checking Account" },
  },
  savings: {
    icon: PiggyBank,
    gradient: "from-income to-income/70",
    bgLight: "from-income/20 to-income/5",
    label: { pt: "Poupança", en: "Savings" },
  },
  wallet: {
    icon: Wallet,
    gradient: "from-accent to-accent/70",
    bgLight: "from-accent/20 to-accent/5",
    label: { pt: "Carteira", en: "Wallet" },
  },
  credit_card: {
    icon: CreditCard,
    gradient: "from-secondary to-secondary/70",
    bgLight: "from-secondary/20 to-secondary/5",
    label: { pt: "Cartão de Crédito", en: "Credit Card" },
  },
};

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const { language, formatCurrency } = usePreferences();
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [statementAccount, setStatementAccount] = useState<Account | null>(null);

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
  const assets = accounts?.filter((a) => (a.current_balance || 0) > 0).reduce((sum, a) => sum + (a.current_balance || 0), 0) || 0;
  const liabilities = Math.abs(accounts?.filter((a) => (a.current_balance || 0) < 0).reduce((sum, a) => sum + (a.current_balance || 0), 0) || 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
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
            {language === "en" ? "Accounts" : "Contas"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en" ? "Manage your bank accounts and wallets" : "Gerencie suas contas bancárias e carteiras"}
          </p>
        </div>

        <AccountDialog />
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {language === "en" ? "Total Balance" : "Patrimônio Total"}
                </p>
                <p
                  className={cn(
                    "text-4xl lg:text-5xl font-display font-bold mt-2",
                    totalBalance >= 0 ? "text-foreground" : "text-expense"
                  )}
                >
                  {formatCurrency(totalBalance)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {accounts?.length || 0} {language === "en" ? "accounts registered" : "contas cadastradas"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-center p-4 rounded-xl bg-income/10 border border-income/20">
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Assets" : "Ativos"}</p>
                  <p className="text-lg font-display font-bold text-income">
                    {formatCurrency(assets)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-expense/10 border border-expense/20">
                  <p className="text-xs text-muted-foreground">{language === "en" ? "Liabilities" : "Passivos"}</p>
                  <p className="text-lg font-display font-bold text-expense">
                    {formatCurrency(liabilities)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accounts Grid */}
      {accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((account, index) => {
            const config = typeConfig[account.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-elevated overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", config.bgLight)}>
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
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
                            onClick={() => setStatementAccount(account)}
                          >
                            <Eye className="w-4 h-4" />
                            {language === "en" ? "View Statement" : "Ver extrato"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => setEditingAccount(account)}
                          >
                            <Pencil className="w-4 h-4" />
                            {language === "en" ? "Edit" : "Editar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => deleteAccount.mutate(account.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            {language === "en" ? "Delete" : "Excluir"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{account.bank_name || (language === "en" ? "No bank" : "Sem banco")}</p>
                      <CardTitle className="font-display text-xl">{account.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={cn(
                        "text-3xl font-display font-bold",
                        (account.current_balance || 0) >= 0 ? "text-foreground" : "text-expense"
                      )}
                    >
                      {formatCurrency(account.current_balance || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{config.label[language]}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              {language === "en" ? "No accounts registered yet." : "Nenhuma conta cadastrada ainda."}
              <br />
              {language === "en" ? 'Click "New Account" to start.' : 'Clique em "Nova Conta" para começar.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Account Dialog */}
      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
        />
      )}

      {/* Account Statement Dialog */}
      {statementAccount && (
        <AccountStatementDialog
          account={statementAccount}
          open={!!statementAccount}
          onOpenChange={(open) => !open && setStatementAccount(null)}
        />
      )}
    </div>
  );
}
