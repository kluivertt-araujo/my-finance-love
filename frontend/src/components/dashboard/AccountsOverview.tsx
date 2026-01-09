import { motion } from "framer-motion";
import { Building2, CreditCard, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { usePreferences } from "@/contexts/PreferencesContext";

interface AccountsOverviewProps {
  accounts: Tables<"accounts">[];
}

const typeConfig = {
  checking: {
    icon: Building2,
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  savings: {
    icon: PiggyBank,
    gradient: "from-income/20 to-income/5",
    iconBg: "bg-income/20",
    iconColor: "text-income",
  },
  wallet: {
    icon: Wallet,
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20",
    iconColor: "text-accent-foreground",
  },
  credit_card: {
    icon: CreditCard,
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
  },
};

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const { t, formatCurrency } = usePreferences();
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">{t("accounts")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("totalBalance")}:{" "}
              <span className={cn("font-semibold", totalBalance >= 0 ? "text-income" : "text-expense")}>
                {formatCurrency(totalBalance)}
              </span>
            </p>
          </div>
          <Link
            to="/accounts"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("edit")}
          </Link>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.slice(0, 4).map((account, index) => {
                const config = typeConfig[account.type] || typeConfig.checking;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "relative overflow-hidden rounded-xl p-4 bg-gradient-to-br border border-border/50 cursor-pointer transition-shadow hover:shadow-soft",
                      config.gradient
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg", config.iconBg)}>
                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{account.bank_name || "Bank"}</p>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p
                        className={cn(
                          "mt-2 text-xl font-display font-bold",
                          (account.current_balance || 0) >= 0 ? "text-foreground" : "text-expense"
                        )}
                      >
                        {formatCurrency(account.current_balance || 0)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {t("noAccounts")}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
