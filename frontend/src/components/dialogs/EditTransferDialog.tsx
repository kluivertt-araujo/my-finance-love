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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTransfer, Transfer } from "@/hooks/useTransfers";
import { useAccounts } from "@/hooks/useAccounts";
import { usePreferences } from "@/contexts/PreferencesContext";

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Conta de origem é obrigatória"),
  to_account_id: z.string().min(1, "Conta de destino é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().max(200).optional(),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: "As contas de origem e destino devem ser diferentes",
  path: ["to_account_id"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface EditTransferDialogProps {
  transfer: Transfer & {
    from_account?: { name: string; bank_name: string | null } | null;
    to_account?: { name: string; bank_name: string | null } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransferDialog({ transfer, open, onOpenChange }: EditTransferDialogProps) {
  const updateTransfer = useUpdateTransfer();
  const { data: accounts } = useAccounts();
  const { language } = usePreferences();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_account_id: transfer.from_account_id,
      to_account_id: transfer.to_account_id,
      amount: transfer.amount,
      date: transfer.date,
      description: transfer.description || "",
    },
  });

  useEffect(() => {
    form.reset({
      from_account_id: transfer.from_account_id,
      to_account_id: transfer.to_account_id,
      amount: transfer.amount,
      date: transfer.date,
      description: transfer.description || "",
    });
  }, [transfer, form]);

  async function onSubmit(values: TransferFormValues) {
    await updateTransfer.mutateAsync({
      id: transfer.id,
      ...values,
      currency: "BRL",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {language === "en" ? "Edit Transfer" : "Editar Transferência"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="from_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "From Account" : "Conta de Origem"}</FormLabel>
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
              name="to_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "To Account" : "Conta de Destino"}</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Description" : "Descrição"}</FormLabel>
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
              <Button type="submit" className="flex-1" disabled={updateTransfer.isPending}>
                {language === "en" ? "Save" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
