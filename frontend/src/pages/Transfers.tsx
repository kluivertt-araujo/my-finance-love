import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TransferDialog } from "@/components/dialogs/TransferDialog";
import { EditTransferDialog } from "@/components/dialogs/EditTransferDialog";
import { TransferFilters, TransferFilterValues } from "@/components/filters/TransferFilters";
import { useTransfers, useDeleteTransfer, Transfer } from "@/hooks/useTransfers";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TransferFilterValues>({});
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const { data: transfers, isLoading } = useTransfers();
  const deleteTransfer = useDeleteTransfer();
  const { t, language, formatCurrency } = usePreferences();

  const transfersList = transfers || [];
  
  // Apply all filters
  const filteredTransfers = transfersList.filter((transfer) => {
    // Search filter
    const fromAccountName = (transfer.from_account as any)?.name?.toLowerCase() || "";
    const toAccountName = (transfer.to_account as any)?.name?.toLowerCase() || "";
    const description = transfer.description?.toLowerCase() || "";
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!fromAccountName.includes(searchLower) && 
          !toAccountName.includes(searchLower) && 
          !description.includes(searchLower)) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateStart) {
      const transferDate = new Date(transfer.date);
      if (transferDate < filters.dateStart) {
        return false;
      }
    }
    
    if (filters.dateEnd) {
      const transferDate = new Date(transfer.date);
      const endDate = new Date(filters.dateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (transferDate > endDate) {
        return false;
      }
    }
    
    // From account filter
    if (filters.fromAccountId && transfer.from_account_id !== filters.fromAccountId) {
      return false;
    }
    
    // To account filter
    if (filters.toAccountId && transfer.to_account_id !== filters.toAccountId) {
      return false;
    }
    
    // Min amount filter
    if (filters.minAmount !== undefined && transfer.amount < filters.minAmount) {
      return false;
    }
    
    // Max amount filter
    if (filters.maxAmount !== undefined && transfer.amount > filters.maxAmount) {
      return false;
    }
    
    return true;
  });

  // Calculate total based on filtered results
  const totalTransferred = filteredTransfers.reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
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
          <h1 className="text-3xl font-display font-bold text-foreground">{t("transfers")}</h1>
          <p className="text-muted-foreground mt-1">
            {language === "en" ? "Move money between your accounts" : "Movimente dinheiro entre suas contas"}
          </p>
        </div>

        <TransferDialog />
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/20">
                <ArrowLeftRight className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Total Transferred (Filtered)" : "Total Transferido (Filtrado)"}
                </p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatCurrency(totalTransferred)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredTransfers.length} {language === "en" ? "transfers" : "transferências"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search transfers..." : "Buscar transferências..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <TransferFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </motion.div>

      {/* Transfers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredTransfers.length > 0 ? (
          filteredTransfers.map((transfer, index) => (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="border-border/50 hover:border-secondary/30 transition-all duration-300 hover:shadow-soft group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-secondary/10">
                        <ArrowLeftRight className="w-5 h-5 text-secondary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {(transfer.from_account as any)?.name || (language === "en" ? "Source account" : "Conta origem")}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            {(transfer.to_account as any)?.name || (language === "en" ? "Destination account" : "Conta destino")}
                          </span>
                        </div>
                        {transfer.description && (
                          <p className="text-sm text-muted-foreground mt-1">{transfer.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-secondary">
                          {formatCurrency(transfer.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transfer.date).toLocaleDateString(language === "en" ? "en-US" : "pt-BR")}
                        </p>
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
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => setEditingTransfer(transfer as Transfer)}
                          >
                            <Pencil className="w-4 h-4" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => deleteTransfer.mutate(transfer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowLeftRight className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                {language === "en" ? "No transfers found." : "Nenhuma transferência encontrada."}
                <br />
                {language === "en" ? 'Click "New Transfer" to add one.' : 'Clique em "Nova Transferência" para adicionar.'}
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Edit Dialog */}
      {editingTransfer && (
        <EditTransferDialog
          transfer={editingTransfer}
          open={!!editingTransfer}
          onOpenChange={(open) => !open && setEditingTransfer(null)}
        />
      )}
    </div>
  );
}
