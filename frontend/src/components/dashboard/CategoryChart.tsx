import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartProps {
  type: "income" | "expense";
  data: CategoryData[];
}

export function CategoryChart({ type, data }: CategoryChartProps) {
  const title = type === "income" ? "Receitas por Categoria" : "Despesas por Categoria";
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = data && data.length > 0 && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle className="font-display text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-3">
                {data.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({((item.value / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma {type === "expense" ? "despesa" : "receita"} no período
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
