import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Filter, SortAsc, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoalDialog } from "@/components/dialogs/GoalDialog";
import { EditGoalDialog } from "@/components/dialogs/EditGoalDialog";
import { ContributionDialog } from "@/components/dialogs/ContributionDialog";
import { GoalCard } from "@/components/goals/GoalCard";
import { useGoals, useDeleteGoal, Goal } from "@/hooks/useGoals";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";

type StatusFilter = "all" | "active" | "completed" | "paused" | "overdue";
type SortOption = "date" | "amount" | "progress" | "deadline";

export default function Goals() {
  const { data: goals, isLoading } = useGoals();
  const { data: categories } = useCategories();
  const deleteGoal = useDeleteGoal();
  const { language, formatCurrency } = usePreferences();

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    if (!goals) return [];

    let filtered = [...goals];

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "overdue") {
        filtered = filtered.filter(
          (g) =>
            g.deadline &&
            new Date(g.deadline) < new Date() &&
            g.status !== "completed" &&
            (g.current_amount || 0) < g.target_amount
        );
      } else {
        filtered = filtered.filter((g) => g.status === statusFilter);
      }
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((g) => g.category_id === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.target_amount - a.target_amount;
        case "progress":
          const progressA = ((a.current_amount || 0) / a.target_amount) * 100;
          const progressB = ((b.current_amount || 0) / b.target_amount) * 100;
          return progressB - progressA;
        case "deadline":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [goals, statusFilter, categoryFilter, sortBy]);

  // Summary calculations
  const summary = useMemo(() => {
    if (!goals) return { total: 0, achieved: 0, remaining: 0, completed: 0 };

    const activeGoals = goals.filter((g) => g.status !== "completed");
    const total = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const achieved = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
    const remaining = total - achieved;
    const completed = goals.filter((g) => g.status === "completed").length;

    return { total, achieved, remaining, completed };
  }, [goals]);

  const handleDelete = async () => {
    if (deletingGoalId) {
      await deleteGoal.mutateAsync(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 w-full" />
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
            {language === "en" ? "Financial Goals" : "Metas Financeiras"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Track your progress towards your financial goals"
              : "Acompanhe seu progresso em direção às suas metas"}
          </p>
        </div>

        <GoalDialog />
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Total Goals" : "Total de Metas"}
            </p>
            <p className="text-2xl font-display font-bold text-primary">
              {formatCurrency(summary.total)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-income/20 bg-gradient-to-br from-income/10 to-transparent">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Achieved" : "Alcançado"}
            </p>
            <p className="text-2xl font-display font-bold text-income">
              {formatCurrency(summary.achieved)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-expense/20 bg-gradient-to-br from-expense/10 to-transparent">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Remaining" : "Restante"}
            </p>
            <p className="text-2xl font-display font-bold text-expense">
              {formatCurrency(summary.remaining)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Completed" : "Concluídas"}
            </p>
            <p className="text-2xl font-display font-bold text-secondary">
              {summary.completed}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "en" ? "All Status" : "Todos os Status"}</SelectItem>
              <SelectItem value="active">{language === "en" ? "Active" : "Ativas"}</SelectItem>
              <SelectItem value="paused">{language === "en" ? "Paused" : "Pausadas"}</SelectItem>
              <SelectItem value="completed">{language === "en" ? "Completed" : "Concluídas"}</SelectItem>
              <SelectItem value="overdue">{language === "en" ? "Overdue" : "Atrasadas"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={language === "en" ? "Category" : "Categoria"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "en" ? "All Categories" : "Todas"}</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{language === "en" ? "Date Created" : "Data de Criação"}</SelectItem>
              <SelectItem value="deadline">{language === "en" ? "Deadline" : "Prazo"}</SelectItem>
              <SelectItem value="amount">{language === "en" ? "Amount" : "Valor"}</SelectItem>
              <SelectItem value="progress">{language === "en" ? "Progress" : "Progresso"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGoals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onEdit={setEditingGoal}
              onDelete={setDeletingGoalId}
              onContribute={setContributingGoal}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              {goals?.length === 0
                ? language === "en"
                  ? "No goals registered yet."
                  : "Nenhuma meta cadastrada ainda."
                : language === "en"
                ? "No goals match the selected filters."
                : "Nenhuma meta corresponde aos filtros selecionados."}
              <br />
              {goals?.length === 0 &&
                (language === "en"
                  ? 'Click "New Goal" to start.'
                  : 'Clique em "Nova Meta" para começar.')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}

      {/* Contribution Dialog */}
      {contributingGoal && (
        <ContributionDialog
          goal={contributingGoal}
          open={!!contributingGoal}
          onOpenChange={(open) => !open && setContributingGoal(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGoalId} onOpenChange={(open) => !open && setDeletingGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "en" ? "Delete Goal?" : "Excluir Meta?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "en"
                ? "This action cannot be undone. All contributions associated with this goal will also be deleted."
                : "Esta ação não pode ser desfeita. Todos os aportes associados a esta meta também serão excluídos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "en" ? "Cancel" : "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === "en" ? "Delete" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
