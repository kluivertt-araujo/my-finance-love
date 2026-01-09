import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface OverviewChartProps {
  data: MonthlyData[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  const hasData = data && data.some((d) => d.receitas > 0 || d.despesas > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      stroke="hsl(var(--income))"
                      strokeWidth={2}
                      fill="url(#incomeGradient)"
                      name="Receitas"
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      stroke="hsl(var(--expense))"
                      strokeWidth={2}
                      fill="url(#expenseGradient)"
                      name="Despesas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-income" />
                  <span className="text-sm text-muted-foreground">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-expense" />
                  <span className="text-sm text-muted-foreground">Despesas</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[350px] flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma transação no período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
