import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateAccount, Account } from "@/hooks/useAccounts";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];

const accountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  type: z.enum(["checking", "savings", "wallet", "credit_card"]),
  bank_name: z.string().max(100).optional(),
  color: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const accountTypeLabels: Record<AccountType, { pt: string; en: string }> = {
  checking: { pt: "Conta Corrente", en: "Checking Account" },
  savings: { pt: "Poupança", en: "Savings Account" },
  wallet: { pt: "Carteira", en: "Wallet" },
  credit_card: { pt: "Cartão de Crédito", en: "Credit Card" },
};

interface EditAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({ account, open, onOpenChange }: EditAccountDialogProps) {
  const updateAccount = useUpdateAccount();
  const { language } = usePreferences();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
      bank_name: account.bank_name || "",
      color: account.color || "#10b981",
    },
  });

  useEffect(() => {
    form.reset({
      name: account.name,
      type: account.type,
      bank_name: account.bank_name || "",
      color: account.color || "#10b981",
    });
  }, [account, form]);

  async function onSubmit(values: AccountFormValues) {
    await updateAccount.mutateAsync({
      id: account.id,
      ...values,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {language === "en" ? "Edit Account" : "Editar Conta"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Account Name" : "Nome da Conta"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Account Type" : "Tipo de Conta"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(accountTypeLabels).map(([value, labels]) => (
                        <SelectItem key={value} value={value}>
                          {labels[language]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Bank Name" : "Nome do Banco"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={language === "en" ? "Optional" : "Opcional"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Color" : "Cor"}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" {...field} className="w-16 h-10 p-1 cursor-pointer" />
                      <Input {...field} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button type="submit" className="flex-1" disabled={updateAccount.isPending}>
                {language === "en" ? "Save" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
