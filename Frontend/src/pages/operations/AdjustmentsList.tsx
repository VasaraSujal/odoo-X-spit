import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { stockAdjustmentsApi } from "@/api/operations";
import type { StockAdjustment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";

export default function AdjustmentsList() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdjustments = async () => {
      try {
        const data = await stockAdjustmentsApi.getStockAdjustments();
        setAdjustments(data);
      } catch (error) {
        console.error("Failed to load adjustments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdjustments();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Adjustments</h1>
            <p className="text-muted-foreground">Record stock count corrections and adjustments</p>
          </div>
          <Button onClick={() => navigate("/operations/adjustments/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Adjustment
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : adjustments.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No adjustments found</p>
                <Button variant="link" onClick={() => navigate("/operations/adjustments/new")}>
                  Create your first adjustment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.referenceNo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{adjustment.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {adjustment.warehouseName} - {adjustment.locationName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{adjustment.warehouseName}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(adjustment.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell className="text-right">
                          <span className={adjustment.difference > 0 ? "text-success" : "text-destructive"}>
                            {adjustment.difference > 0 ? "+" : ""}{adjustment.difference}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={adjustment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/operations/adjustments/${adjustment.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
