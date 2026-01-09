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
import { useCreateTransfer } from "@/hooks/useTransfers";
import { useAccounts } from "@/hooks/useAccounts";
import { usePreferences } from "@/contexts/PreferencesContext";

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Conta de origem é obrigatória"),
  to_account_id: z.string().min(1, "Conta de destino é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().optional(),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: "Conta de origem e destino devem ser diferentes",
  path: ["to_account_id"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferDialog() {
  const [open, setOpen] = useState(false);
  const createTransfer = useCreateTransfer();
  const { data: accounts } = useAccounts();
  const { t, language } = usePreferences();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_account_id: "",
      to_account_id: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const onSubmit = async (values: TransferFormValues) => {
    await createTransfer.mutateAsync({
      from_account_id: values.from_account_id,
      to_account_id: values.to_account_id,
      amount: values.amount,
      date: values.date,
      description: values.description,
      currency: "BRL",
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("newTransfer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("newTransfer")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="from_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fromAccount")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.bank_name})
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
                  <FormLabel>{t("toAccount")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select" : "Selecione"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.bank_name})
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={language === "en" ? "Ex: Monthly reserve" : "Ex: Reserva mensal"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createTransfer.isPending}>
                {createTransfer.isPending ? t("loading") : t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
