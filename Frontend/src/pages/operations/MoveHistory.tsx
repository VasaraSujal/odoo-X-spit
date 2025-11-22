import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { stockMovementsApi } from "@/api/operations";
import type { StockMovement } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function MoveHistory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [movementType, setMovementType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const data = await stockMovementsApi.getStockMovements();
        setMovements(data);
        setFilteredMovements(data);
      } catch (error) {
        console.error("Failed to load movements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovements();
  }, []);

  useEffect(() => {
    let filtered = [...movements];

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.productSku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (movementType !== "all") {
      filtered = filtered.filter((m) => m.movementType === movementType);
    }

    setFilteredMovements(filtered);
  }, [searchTerm, movementType, movements]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Move History / Stock Ledger</h1>
          <p className="text-muted-foreground">Complete log of all stock movements</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredMovements.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No movements found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>From/To</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(movement.timestamp), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="capitalize">{movement.movementType}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.productName}</p>
                            <p className="text-xs text-muted-foreground">{movement.productSku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {movement.fromLocation && (
                              <p className="text-muted-foreground">From: {movement.fromLocation}</p>
                            )}
                            {movement.toLocation && (
                              <p>To: {movement.toLocation}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={movement.quantityChange > 0 ? "text-success" : "text-destructive"}>
                            {movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}
                          </span>
                        </TableCell>
                        <TableCell>{movement.warehouseName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.referenceDocumentType}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
