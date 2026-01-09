import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Transfer = Tables<"transfers">;
export type TransferInsert = TablesInsert<"transfers">;
export type TransferUpdate = TablesUpdate<"transfers">;

export function useTransfers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transfers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          from_account:from_account_id(name, bank_name),
          to_account:to_account_id(name, bank_name)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transfer: Omit<TransferInsert, "user_id">) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("transfers")
        .insert({ ...transfer, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transferência criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar transferência: " + error.message);
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...transfer }: TransferUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("transfers")
        .update(transfer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transferência atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar transferência: " + error.message);
    },
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transfers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transferência excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir transferência: " + error.message);
    },
  });
}
