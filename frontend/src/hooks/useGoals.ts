import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number | null;
  deadline: string | null;
  category_id: string | null;
  status: "active" | "completed" | "paused";
  is_completed: boolean | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
}

export interface GoalInsert {
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  category_id?: string | null;
  status?: "active" | "completed" | "paused";
}

export interface GoalUpdate {
  id: string;
  name?: string;
  description?: string | null;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  category_id?: string | null;
  status?: "active" | "completed" | "paused";
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  account_id: string | null;
  amount: number;
  date: string;
  description: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
    color: string | null;
  };
  goal?: {
    id: string;
    name: string;
  };
}

export interface ContributionInsert {
  goal_id: string;
  account_id: string;
  amount: number;
  date?: string;
  description?: string | null;
  transaction_id?: string | null;
}

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });
}

export function useGoalContributions(goalId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goal_contributions", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_contributions")
        .select(`
          *,
          account:accounts(id, name, color)
        `)
        .eq("goal_id", goalId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as GoalContribution[];
    },
    enabled: !!user && !!goalId,
  });
}

// Fetch all contributions for a specific account (for account statements)
export function useAccountContributions(accountId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["account_contributions", accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goal_contributions")
        .select(`
          *,
          goal:financial_goals(id, name)
        `)
        .eq("account_id", accountId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as GoalContribution[];
    },
    enabled: !!user && !!accountId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goal: GoalInsert) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          ...goal,
          user_id: user.id,
          status: goal.status || "active",
          current_amount: goal.current_amount || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...goal }: GoalUpdate) => {
      const updateData: Record<string, unknown> = { ...goal };
      
      // Update is_completed based on status
      if (goal.status === "completed") {
        updateData.is_completed = true;
      } else if (goal.status) {
        updateData.is_completed = false;
      }

      const { data, error } = await supabase
        .from("financial_goals")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar meta: " + error.message);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir meta: " + error.message);
    },
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contribution: ContributionInsert) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Check if account has sufficient balance
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("current_balance, name")
        .eq("id", contribution.account_id)
        .single();

      if (accountError) throw accountError;

      if ((accountData.current_balance || 0) < contribution.amount) {
        throw new Error(`Saldo insuficiente na conta ${accountData.name}`);
      }

      // First, add the contribution with account_id
      const { data: contribData, error: contribError } = await supabase
        .from("goal_contributions")
        .insert({
          goal_id: contribution.goal_id,
          account_id: contribution.account_id,
          amount: contribution.amount,
          description: contribution.description,
          transaction_id: contribution.transaction_id,
          user_id: user.id,
          date: contribution.date || new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (contribError) throw contribError;

      // Deduct from account balance
      const { error: deductError } = await supabase
        .from("accounts")
        .update({
          current_balance: (accountData.current_balance || 0) - contribution.amount,
        })
        .eq("id", contribution.account_id);

      if (deductError) throw deductError;

      // Then, update the goal's current_amount
      const { data: goalData, error: goalError } = await supabase
        .from("financial_goals")
        .select("current_amount, target_amount")
        .eq("id", contribution.goal_id)
        .single();

      if (goalError) throw goalError;

      const newAmount = (goalData.current_amount || 0) + contribution.amount;
      const isCompleted = newAmount >= goalData.target_amount;

      await supabase
        .from("financial_goals")
        .update({
          current_amount: newAmount,
          status: isCompleted ? "completed" : "active",
          is_completed: isCompleted,
        })
        .eq("id", contribution.goal_id);

      return contribData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_contributions", variables.goal_id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Aporte adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar aporte: " + error.message);
    },
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, goalId, amount, accountId }: { id: string; goalId: string; amount: number; accountId: string | null }) => {
      // First, restore the account balance if there's an account linked
      if (accountId) {
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("current_balance")
          .eq("id", accountId)
          .single();

        if (accountError) throw accountError;

        const { error: restoreError } = await supabase
          .from("accounts")
          .update({
            current_balance: (accountData.current_balance || 0) + amount,
          })
          .eq("id", accountId);

        if (restoreError) throw restoreError;
      }

      // Delete the contribution
      const { error: deleteError } = await supabase
        .from("goal_contributions")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Then, update the goal's current_amount
      const { data: goalData, error: goalError } = await supabase
        .from("financial_goals")
        .select("current_amount, target_amount")
        .eq("id", goalId)
        .single();

      if (goalError) throw goalError;

      const newAmount = Math.max(0, (goalData.current_amount || 0) - amount);

      await supabase
        .from("financial_goals")
        .update({
          current_amount: newAmount,
          status: "active",
          is_completed: false,
        })
        .eq("id", goalId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal_contributions", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account_contributions"] });
      toast.success("Aporte removido com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao remover aporte: " + error.message);
    },
  });
}
