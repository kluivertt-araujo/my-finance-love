import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  Briefcase,
  TrendingUp,
  Gift,
  Zap,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CategoryDialog } from "@/components/dialogs/CategoryDialog";
import { useCategories, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  "shopping-cart": ShoppingCart,
  car: Car,
  heart: Heart,
  "gamepad-2": Gamepad2,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  gift: Gift,
  zap: Zap,
  "graduation-cap": GraduationCap,
  tag: Tag,
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  const { data: categories, isLoading } = useCategories(activeTab);
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleActive = async (id: string, currentValue: boolean | null) => {
    await updateCategory.mutateAsync({ id, is_active: !currentValue });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize suas transações com categorias personalizadas
          </p>
        </div>

        <CategoryDialog />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expense" | "income")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense" className="gap-2">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2">
            Receitas
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories Grid */}
          <TabsContent value={activeTab} className="mt-0">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => {
                  const Icon = iconMap[category.icon || "tag"] || Tag;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card
                        className={cn(
                          "border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-elevated group",
                          !category.is_active && "opacity-60"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Icon className="w-5 h-5 text-foreground" />
                              </div>
                              <div>
                                <CardTitle className="font-display text-lg">
                                  {category.name}
                                </CardTitle>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2">
                                  <Pencil className="w-4 h-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => deleteCategory.mutate(category.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {/* Active Toggle */}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">Ativa</span>
                            <Switch
                              checked={category.is_active ?? true}
                              onCheckedChange={() => handleToggleActive(category.id, category.is_active)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tag className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhuma categoria encontrada.
                    <br />
                    Clique em "Nova Categoria" para criar.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
