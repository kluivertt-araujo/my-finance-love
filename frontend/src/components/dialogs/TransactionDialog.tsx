import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus } from "lucide-react";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Database } from "@/integrations/supabase/types";

type RecurrenceType = Database["public"]["Enums"]["recurrence_type"];

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().optional(),
  payment_method: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"] as const).default("none"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionDialogProps {
  type: "income" | "expense";
}

const recurrenceLabels: Record<RecurrenceType, string> = {
  none: "Nenhuma",
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function TransactionDialog({ type }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const createTransaction = useCreateTransaction();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories(type);
  const { t, language } = usePreferences();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      account_id: "",
      category_id: "",
      payment_method: "",
      recurrence: "none",
      notes: "",
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    await createTransaction.mutateAsync({
      description: values.description,
      amount: values.amount,
      date: values.date,
      account_id: values.account_id,
      category_id: values.category_id || null,
      payment_method: values.payment_method,
      recurrence: values.recurrence,
      notes: values.notes,
      currency: "BRL",
      type,
    });
    form.reset();
    setOpen(false);
  };

  const isIncome = type === "income";

  const recurrenceLabelsTranslated: Record<RecurrenceType, string> = language === "en" ? {
    none: "None",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  } : recurrenceLabels;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`gap-2 ${
            isIncome
              ? "bg-income hover:bg-income/90 text-income-foreground shadow-glow"
              : "bg-expense hover:bg-expense/90 text-expense-foreground"
          }`}
        >
          <Plus className="w-4 h-4" />
          {isIncome ? t("newIncome") : t("newExpense")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isIncome ? t("newIncome") : t("newExpense")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Input placeholder={isIncome ? "Ex: Salário" : "Ex: Supermercado"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")} (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("date")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("account")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Payment Method" : "Forma de Pagamento"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="debit">{language === "en" ? "Debit" : "Débito"}</SelectItem>
                        <SelectItem value="credit">{language === "en" ? "Credit" : "Crédito"}</SelectItem>
                        <SelectItem value="cash">{language === "en" ? "Cash" : "Dinheiro"}</SelectItem>
                        <SelectItem value="transfer">{language === "en" ? "Transfer" : "Transferência"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Recurrence" : "Recorrência"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(recurrenceLabelsTranslated) as RecurrenceType[]).map((rec) => (
                          <SelectItem key={rec} value={rec}>
                            {recurrenceLabelsTranslated[rec]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={language === "en" ? "Add notes..." : "Adicione notas..."} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createTransaction.isPending}>
                {createTransaction.isPending ? t("loading") : t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
