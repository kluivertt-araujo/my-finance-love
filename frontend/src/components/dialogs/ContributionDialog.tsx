import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PiggyBank, Plus, Trash2, Wallet, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useGoalContributions,
  useAddContribution,
  useDeleteContribution,
  Goal,
} from "@/hooks/useGoals";
import { useAccounts } from "@/hooks/useAccounts";
import { usePreferences } from "@/contexts/PreferencesContext";

const contributionSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  account_id: z.string().min(1, "Selecione uma conta"),
  date: z.date(),
  description: z.string().max(200).optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContributionDialog({ goal, open, onOpenChange }: ContributionDialogProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: contributions, isLoading } = useGoalContributions(goal.id);
  const { data: accounts } = useAccounts();
  const addContribution = useAddContribution();
  const deleteContribution = useDeleteContribution();
  const { language, formatCurrency } = usePreferences();

  const activeAccounts = accounts?.filter(acc => acc.is_active) || [];

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
      account_id: "",
      date: new Date(),
      description: "",
    },
  });

  const selectedAccountId = form.watch("account_id");
  const selectedAccount = activeAccounts.find(acc => acc.id === selectedAccountId);

  const onSubmit = async (data: ContributionFormData) => {
    await addContribution.mutateAsync({
      goal_id: goal.id,
      account_id: data.account_id,
      amount: data.amount,
      date: format(data.date, "yyyy-MM-dd"),
      description: data.description || null,
    });
    form.reset({ amount: 0, account_id: "", date: new Date(), description: "" });
    setShowForm(false);
  };

  const handleDeleteContribution = async (id: string, amount: number, accountId: string | null) => {
    await deleteContribution.mutateAsync({
      id,
      goalId: goal.id,
      amount,
      accountId,
    });
  };

  const remaining = goal.target_amount - (goal.current_amount || 0);
  const progress = Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            {language === "en" ? "Contributions" : "Aportes"}: {goal.name}
          </DialogTitle>
          <DialogDescription>
            {language === "en"
              ? "Manage contributions to this goal."
              : "Gerencie os aportes para esta meta."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{language === "en" ? "Progress" : "Progresso"}</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                progress >= 100 ? "bg-income" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>
              <span className="text-muted-foreground">{language === "en" ? "Current" : "Atual"}: </span>
              <span className="font-semibold text-income">{formatCurrency(goal.current_amount || 0)}</span>
            </span>
            <span>
              <span className="text-muted-foreground">{language === "en" ? "Remaining" : "Restante"}: </span>
              <span className="font-semibold text-expense">{formatCurrency(Math.max(0, remaining))}</span>
            </span>
          </div>
        </div>

        {/* Add Contribution Form */}
        {showForm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Source Account" : "Conta de Origem"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "en" ? "Select account" : "Selecione a conta"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4" style={{ color: account.color || undefined }} />
                              <span>{account.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({formatCurrency(account.current_balance || 0)})
                              </span>
                            </div>
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
                    <FormLabel>{language === "en" ? "Amount (R$)" : "Valor (R$)"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedAccount?.current_balance || undefined}
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {selectedAccount && (
                      <p className="text-xs text-muted-foreground">
                        {language === "en" ? "Available balance" : "Saldo disponível"}: {formatCurrency(selectedAccount.current_balance || 0)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{language === "en" ? "Date" : "Data"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {format(field.value, "dd/MM/yyyy")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && field.onChange(date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Description (optional)" : "Descrição (opcional)"}</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={addContribution.isPending}
                >
                  {addContribution.isPending
                    ? language === "en" ? "Adding..." : "Adicionando..."
                    : language === "en" ? "Add" : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Button onClick={() => setShowForm(true)} className="gap-2 w-full">
            <Plus className="w-4 h-4" />
            {language === "en" ? "Add Contribution" : "Adicionar Aporte"}
          </Button>
        )}

        {/* Contributions List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {language === "en" ? "Contribution History" : "Histórico de Aportes"}
          </h4>
          <ScrollArea className="h-48">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                {language === "en" ? "Loading..." : "Carregando..."}
              </div>
            ) : contributions && contributions.length > 0 ? (
              <div className="space-y-2">
                {contributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-income">
                        + {formatCurrency(contribution.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(contribution.date), "dd/MM/yyyy")}
                      </p>
                      {contribution.account && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" style={{ color: contribution.account.color || undefined }} />
                          <span className="truncate">{contribution.account.name}</span>
                        </p>
                      )}
                      {contribution.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {contribution.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => handleDeleteContribution(contribution.id, contribution.amount, contribution.account_id)}
                      disabled={deleteContribution.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === "en" ? "No contributions yet." : "Nenhum aporte ainda."}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
