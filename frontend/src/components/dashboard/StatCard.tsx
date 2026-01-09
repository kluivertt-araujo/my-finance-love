import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  variant?: "default" | "income" | "expense" | "balance";
  delay?: number;
}

const variantStyles = {
  default: "bg-card border-border",
  income: "bg-gradient-to-br from-income/10 to-income/5 border-income/20",
  expense: "bg-gradient-to-br from-expense/10 to-expense/5 border-expense/20",
  balance: "bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  income: "bg-income/20 text-income",
  expense: "bg-expense/20 text-expense",
  balance: "bg-primary/20 text-primary",
};

export function StatCard({ title, value, change, icon, variant = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-shadow duration-300 hover:shadow-elevated",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-card-foreground">{value}</p>
          
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change.isPositive ? "text-income" : "text-expense"
            )}>
              {change.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change.value)}% vs mês anterior</span>
            </div>
          )}
        </div>

        <div className={cn(
          "rounded-xl p-3",
          iconStyles[variant]
        )}>
          {icon}
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl" />
    </motion.div>
  );
}
