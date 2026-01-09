import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  language: string;
  currency: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          const newProfile = {
            user_id: user.id,
            name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
            email: user.email || "",
            language: "pt",
            currency: "BRL",
            theme: "light",
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();
          
          if (createError) throw createError;
          return createdProfile as Profile;
        }
        throw error;
      }
      
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", user?.id], data);
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
  };
}
