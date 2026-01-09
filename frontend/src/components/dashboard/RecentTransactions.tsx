import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { usePreferences } from "@/contexts/PreferencesContext";

interface TransactionWithCategory extends Tables<"transactions"> {
  categories?: {
    name: string;
    color: string | null;
  } | null;
}

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    bgColor: "bg-income/10",
    iconColor: "text-income",
    amountColor: "text-income",
    prefix: "+",
  },
  expense: {
    icon: TrendingDown,
    bgColor: "bg-expense/10",
    iconColor: "text-expense",
    amountColor: "text-expense",
    prefix: "-",
  },
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t, formatCurrency, language } = usePreferences();
  const dateLocale = language === "pt" ? "pt-BR" : "en-US";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">{t("recentTransactions")}</CardTitle>
          <Link
            to="/expenses"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("viewAll")}
          </Link>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction, index) => {
                const config = typeConfig[transaction.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description || t("noData")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.categories?.name || t("noData")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-semibold", config.amountColor)}>
                        {config.prefix}{formatCurrency(Number(transaction.amount))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {t("noTransactions")}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
