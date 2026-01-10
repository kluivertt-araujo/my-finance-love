import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Target } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useUpdateGoal, Goal } from "@/hooks/useGoals";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  description: z.string().max(500).optional(),
  target_amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  deadline: z.date().optional().nullable(),
  category_id: z.string().optional(),
  status: z.enum(["active", "completed", "paused"]),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const updateGoal = useUpdateGoal();
  const { data: categories } = useCategories();
  const { language } = usePreferences();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      description: goal.description || "",
      target_amount: goal.target_amount,
      deadline: goal.deadline ? new Date(goal.deadline) : null,
      category_id: goal.category_id || "none",
      status: goal.status || "active",
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name,
        description: goal.description || "",
        target_amount: goal.target_amount,
        deadline: goal.deadline ? new Date(goal.deadline) : null,
        category_id: goal.category_id || "none",
        status: goal.status || "active",
      });
    }
  }, [goal, form]);

  const onSubmit = async (data: GoalFormData) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      name: data.name,
      description: data.description || null,
      target_amount: data.target_amount,
      deadline: data.deadline ? format(data.deadline, "yyyy-MM-dd") : null,
      category_id: data.category_id === "none" ? null : data.category_id,
      status: data.status,
    });
    onOpenChange(false);
  };

  const statusOptions = [
    { value: "active", label: language === "en" ? "Active" : "Ativa" },
    { value: "paused", label: language === "en" ? "Paused" : "Pausada" },
    { value: "completed", label: language === "en" ? "Completed" : "Concluída" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {language === "en" ? "Edit Goal" : "Editar Meta"}
          </DialogTitle>
          <DialogDescription>
            {language === "en"
              ? "Update your financial goal details."
              : "Atualize os detalhes da sua meta financeira."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Goal Name" : "Nome da Meta"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{language === "en" ? "Description" : "Descrição"}</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Target Amount (R$)" : "Valor da Meta (R$)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{language === "en" ? "Target Date" : "Data Alvo"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>{language === "en" ? "No date" : "Sem data"}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
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
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Category" : "Categoria"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {language === "en" ? "No category" : "Sem categoria"}
                      </SelectItem>
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateGoal.isPending}
              >
                {updateGoal.isPending
                  ? language === "en" ? "Saving..." : "Salvando..."
                  : language === "en" ? "Save" : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
