import { motion } from "framer-motion";
import { format, isPast, isAfter, differenceInDays } from "date-fns";
import {
  Target,
  MoreHorizontal,
  Pencil,
  Trash2,
  PiggyBank,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Goal } from "@/hooks/useGoals";
import { usePreferences } from "@/contexts/PreferencesContext";

interface GoalCardProps {
  goal: Goal;
  index: number;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: Goal) => void;
}

export function GoalCard({ goal, index, onEdit, onDelete, onContribute }: GoalCardProps) {
  const { language, formatCurrency } = usePreferences();

  const currentAmount = goal.current_amount || 0;
  const progress = Math.min(100, (currentAmount / goal.target_amount) * 100);
  const remaining = Math.max(0, goal.target_amount - currentAmount);

  // Status logic
  const isCompleted = goal.status === "completed" || progress >= 100;
  const isPaused = goal.status === "paused";
  const isOverdue = goal.deadline && isPast(new Date(goal.deadline)) && !isCompleted;
  const daysRemaining = goal.deadline
    ? differenceInDays(new Date(goal.deadline), new Date())
    : null;
  const isCloseToDeadline = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        icon: CheckCircle2,
        label: language === "en" ? "Completed" : "Concluída",
        color: "text-income",
        bg: "bg-income/10",
        border: "border-income/30",
      };
    }
    if (isPaused) {
      return {
        icon: Pause,
        label: language === "en" ? "Paused" : "Pausada",
        color: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-muted",
      };
    }
    if (isOverdue) {
      return {
        icon: AlertTriangle,
        label: language === "en" ? "Overdue" : "Atrasada",
        color: "text-expense",
        bg: "bg-expense/10",
        border: "border-expense/30",
      };
    }
    return {
      icon: TrendingUp,
      label: language === "en" ? "In Progress" : "Em andamento",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          "border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-elevated overflow-hidden group",
          isCloseToDeadline && !isCompleted && "border-accent/50",
          isOverdue && "border-expense/50"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                <Target className={cn("w-4 h-4", statusConfig.color)} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  statusConfig.bg,
                  statusConfig.color
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </div>
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
                <DropdownMenuItem className="gap-2" onClick={() => onContribute(goal)}>
                  <PiggyBank className="w-4 h-4" />
                  {language === "en" ? "Add Contribution" : "Adicionar Aporte"}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => onEdit(goal)}>
                  <Pencil className="w-4 h-4" />
                  {language === "en" ? "Edit" : "Editar"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-destructive"
                  onClick={() => onDelete(goal.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {language === "en" ? "Delete" : "Excluir"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3">
            <h3 className="font-display text-lg font-semibold text-foreground">{goal.name}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{language === "en" ? "Progress" : "Progresso"}</span>
              <span className={cn("font-semibold", isCompleted ? "text-income" : "text-foreground")}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress
                value={progress}
                className={cn(
                  "h-3",
                  isCompleted && "[&>div]:bg-income",
                  isOverdue && "[&>div]:bg-expense",
                  isPaused && "[&>div]:bg-muted-foreground"
                )}
              />
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{language === "en" ? "Current" : "Atual"}</p>
              <p className="text-lg font-display font-bold text-income">
                {formatCurrency(currentAmount)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground">{language === "en" ? "Target" : "Meta"}</p>
              <p className="text-lg font-display font-bold text-foreground">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          {/* Remaining */}
          {!isCompleted && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">
                {language === "en" ? "Remaining" : "Faltam"}
              </span>
              <span className="text-sm font-semibold text-expense">
                {formatCurrency(remaining)}
              </span>
            </div>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                isOverdue ? "text-expense" : isCloseToDeadline ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {isOverdue
                  ? language === "en"
                    ? `Overdue since ${format(new Date(goal.deadline), "dd/MM/yyyy")}`
                    : `Atrasada desde ${format(new Date(goal.deadline), "dd/MM/yyyy")}`
                  : language === "en"
                  ? `Due ${format(new Date(goal.deadline), "dd/MM/yyyy")}`
                  : `Prazo: ${format(new Date(goal.deadline), "dd/MM/yyyy")}`}
                {daysRemaining !== null && daysRemaining > 0 && !isCompleted && (
                  <span className="ml-1">
                    ({daysRemaining} {language === "en" ? "days left" : "dias restantes"})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Category */}
          {goal.category && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: goal.category.color || "#6366f1" }}
              />
              <span className="text-xs text-muted-foreground">{goal.category.name}</span>
            </div>
          )}

          {/* Add Contribution Button */}
          {!isCompleted && !isPaused && (
            <Button
              variant="outline"
              className="w-full gap-2 mt-2"
              onClick={() => onContribute(goal)}
            >
              <PiggyBank className="w-4 h-4" />
              {language === "en" ? "Add Contribution" : "Adicionar Aporte"}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
