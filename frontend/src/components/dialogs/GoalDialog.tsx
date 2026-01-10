import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateGoal } from "@/hooks/useGoals";
import { useCategories } from "@/hooks/useCategories";
import { usePreferences } from "@/contexts/PreferencesContext";

const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  description: z.string().max(500).optional(),
  target_amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  deadline: z.date().optional(),
  category_id: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export function GoalDialog() {
  const [open, setOpen] = useState(false);
  const createGoal = useCreateGoal();
  const { data: categories } = useCategories();
  const { language } = usePreferences();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      target_amount: 0,
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    await createGoal.mutateAsync({
      name: data.name,
      description: data.description || null,
      target_amount: data.target_amount,
      deadline: data.deadline ? format(data.deadline, "yyyy-MM-dd") : null,
      category_id: data.category_id === "none" ? null : data.category_id,
      status: "active",
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {language === "en" ? "New Goal" : "Nova Meta"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {language === "en" ? "New Financial Goal" : "Nova Meta Financeira"}
          </DialogTitle>
          <DialogDescription>
            {language === "en"
              ? "Set a new financial goal to track your progress."
              : "Defina uma nova meta financeira para acompanhar seu progresso."}
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
                    <Input
                      placeholder={language === "en" ? "e.g., Emergency Fund" : "ex: Reserva de Emergência"}
                      {...field}
                    />
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
                  <FormLabel>{language === "en" ? "Description (optional)" : "Descrição (opcional)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={language === "en" ? "Describe your goal..." : "Descreva sua meta..."}
                      className="resize-none"
                      {...field}
                    />
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
                      placeholder="0,00"
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
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{language === "en" ? "Target Date (optional)" : "Data Alvo (opcional)"}</FormLabel>
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
                            <span>{language === "en" ? "Select date" : "Selecione a data"}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
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
                  <FormLabel>{language === "en" ? "Category (optional)" : "Categoria (opcional)"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select category" : "Selecione a categoria"} />
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
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createGoal.isPending}
              >
                {createGoal.isPending
                  ? language === "en" ? "Creating..." : "Criando..."
                  : language === "en" ? "Create Goal" : "Criar Meta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
