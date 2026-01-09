import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTransaction, Transaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(200),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().optional(),
  payment_method: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional(),
  notes: z.string().max(500).optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface EditTransactionDialogProps {
  transaction: Transaction & { 
    accounts?: { name: string; bank_name: string | null } | null;
    categories?: { name: string; icon: string | null; color: string | null } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  { value: "pix", label: { pt: "PIX", en: "PIX" } },
  { value: "debit", label: { pt: "Débito", en: "Debit" } },
  { value: "credit", label: { pt: "Crédito", en: "Credit" } },
  { value: "cash", label: { pt: "Dinheiro", en: "Cash" } },
  { value: "transfer", label: { pt: "Transferência", en: "Transfer" } },
];

const recurrenceOptions = [
  { value: "none", label: { pt: "Nenhuma", en: "None" } },
  { value: "daily", label: { pt: "Diária", en: "Daily" } },
  { value: "weekly", label: { pt: "Semanal", en: "Weekly" } },
  { value: "monthly", label: { pt: "Mensal", en: "Monthly" } },
  { value: "yearly", label: { pt: "Anual", en: "Yearly" } },
];

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const updateTransaction = useUpdateTransaction();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { language } = usePreferences();

  const filteredCategories = categories?.filter((c) => c.type === transaction.type) || [];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction.description || "",
      amount: transaction.amount,
      date: transaction.date,
      account_id: transaction.account_id,
      category_id: transaction.category_id || undefined,
      payment_method: transaction.payment_method || undefined,
      recurrence: transaction.recurrence || "none",
      notes: transaction.notes || "",
    },
  });

  useEffect(() => {
    form.reset({
      description: transaction.description || "",
      amount: transaction.amount,
      date: transaction.date,
      account_id: transaction.account_id,
      category_id: transaction.category_id || undefined,
      payment_method: transaction.payment_method || undefined,
      recurrence: transaction.recurrence || "none",
      notes: transaction.notes || "",
    });
  }, [transaction, form]);

  async function onSubmit(values: TransactionFormValues) {
    await updateTransaction.mutateAsync({
      id: transaction.id,
      ...values,
      currency: "BRL",
    });
    onOpenChange(false);
  }

  const isIncome = transaction.type === "income";
  const title = language === "en" 
    ? `Edit ${isIncome ? "Income" : "Expense"}` 
    : `Editar ${isIncome ? "Receita" : "Despesa"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Description" : "Descrição"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Amount" : "Valor"}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                    <FormLabel>{language === "en" ? "Date" : "Data"}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Account" : "Conta"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select account" : "Selecione a conta"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} {account.bank_name && `- ${account.bank_name}`}
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
                  <FormLabel>{language === "en" ? "Category" : "Categoria"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select category" : "Selecione a categoria"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Payment Method" : "Forma de Pagamento"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label[language]}
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
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Recurrence" : "Recorrência"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recurrenceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label[language]}
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
                  <FormLabel>{language === "en" ? "Notes" : "Observações"}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
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
              <Button type="submit" className="flex-1" disabled={updateTransaction.isPending}>
                {language === "en" ? "Save" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
