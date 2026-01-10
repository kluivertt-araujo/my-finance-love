import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { usePreferences } from "@/contexts/PreferencesContext";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

export interface TransactionFilterValues {
  categoryId?: string;
  accountId?: string;
  paymentMethod?: string;
  recurrence?: string;
  dateStart?: Date;
  dateEnd?: Date;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionFiltersProps {
  type: "income" | "expense";
  filters: TransactionFilterValues;
  onFiltersChange: (filters: TransactionFilterValues) => void;
}

const paymentMethods = [
  { value: "pix", labelPt: "PIX", labelEn: "PIX" },
  { value: "debit", labelPt: "Débito", labelEn: "Debit" },
  { value: "credit", labelPt: "Crédito", labelEn: "Credit" },
  { value: "cash", labelPt: "Dinheiro", labelEn: "Cash" },
  { value: "transfer", labelPt: "Transferência", labelEn: "Transfer" },
];

const recurrenceOptions = [
  { value: "none", labelPt: "Nenhuma", labelEn: "None" },
  { value: "daily", labelPt: "Diária", labelEn: "Daily" },
  { value: "weekly", labelPt: "Semanal", labelEn: "Weekly" },
  { value: "monthly", labelPt: "Mensal", labelEn: "Monthly" },
  { value: "yearly", labelPt: "Anual", labelEn: "Yearly" },
];

export function TransactionFilters({ type, filters, onFiltersChange }: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateStartOpen, setDateStartOpen] = useState(false);
  const [dateEndOpen, setDateEndOpen] = useState(false);
  const { data: categories } = useCategories(type);
  const { data: accounts } = useAccounts();
  const { t, language } = usePreferences();

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  const handleClear = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  const handleFilterChange = (key: keyof TransactionFilterValues, value: any) => {
    if (value === "" || value === undefined || value === "all") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const dateLocale = language === "pt" ? ptBR : enUS;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {t("filter")}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {language === "en" ? "Filters" : "Filtros"}
            </h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2 text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                {language === "en" ? "Clear" : "Limpar"}
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(value) => handleFilterChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "All categories" : "Todas as categorias"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All categories" : "Todas as categorias"}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>
          </div>

          {/* Recurrence Filter */}
          <div className="space-y-2">
            <Label>{language === "en" ? "Recurrence" : "Recorrência"}</Label>
            <Select
              value={filters.recurrence || "all"}
              onValueChange={(value) => handleFilterChange("recurrence", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "All recurrences" : "Todas as recorrências"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All recurrences" : "Todas as recorrências"}</SelectItem>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {language === "en" ? option.labelEn : option.labelPt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Filter - Only for Income */}
          {type === "income" && (
            <div className="space-y-2">
              <Label>{t("account")}</Label>
              <Select
                value={filters.accountId || "all"}
                onValueChange={(value) => handleFilterChange("accountId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === "en" ? "All accounts" : "Todas as contas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "en" ? "All accounts" : "Todas as contas"}</SelectItem>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Method Filter - Only for Expense */}
          {type === "expense" && (
            <div className="space-y-2">
              <Label>{language === "en" ? "Payment Method" : "Forma de Pagamento"}</Label>
              <Select
                value={filters.paymentMethod || "all"}
                onValueChange={(value) => handleFilterChange("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === "en" ? "All methods" : "Todos os métodos"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "en" ? "All methods" : "Todos os métodos"}</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {language === "en" ? method.labelEn : method.labelPt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range - Only for Expense */}
          {type === "expense" && (
            <div className="space-y-2">
              <Label>{language === "en" ? "Date Range" : "Período"}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover open={dateStartOpen} onOpenChange={setDateStartOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal text-sm h-9">
                      {filters.dateStart
                        ? format(filters.dateStart, "dd/MM/yy", { locale: dateLocale })
                        : language === "en" ? "Start" : "Início"}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateStart}
                      onSelect={(date) => {
                        handleFilterChange("dateStart", date);
                        setDateStartOpen(false);
                      }}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={dateEndOpen} onOpenChange={setDateEndOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal text-sm h-9">
                      {filters.dateEnd
                        ? format(filters.dateEnd, "dd/MM/yy", { locale: dateLocale })
                        : language === "en" ? "End" : "Fim"}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateEnd}
                      onSelect={(date) => {
                        handleFilterChange("dateEnd", date);
                        setDateEndOpen(false);
                      }}
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Value Range */}
          <div className="space-y-2">
            <Label>{language === "en" ? "Amount Range" : "Faixa de Valor"}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={language === "en" ? "Min" : "Mínimo"}
                value={filters.minAmount || ""}
                onChange={(e) => handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : undefined)}
                className="h-9"
              />
              <Input
                type="number"
                placeholder={language === "en" ? "Max" : "Máximo"}
                value={filters.maxAmount || ""}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
                className="h-9"
              />
            </div>
          </div>

          {/* Apply Button */}
          <Button onClick={handleApply} className="w-full">
            {language === "en" ? "Apply Filters" : "Aplicar Filtros"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
