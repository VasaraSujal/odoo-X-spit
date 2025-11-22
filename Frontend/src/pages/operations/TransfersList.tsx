import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { internalTransfersApi } from "@/api/operations";
import type { InternalTransfer } from "@/types";
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
import { Plus, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function TransfersList() {
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const data = await internalTransfersApi.getInternalTransfers();
        setTransfers(data);
      } catch (error) {
        console.error("Failed to load transfers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransfers();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Internal Transfers</h1>
            <p className="text-muted-foreground">Move stock between warehouses and locations</p>
          </div>
          <Button onClick={() => navigate("/operations/transfers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Transfer
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : transfers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No transfers found</p>
                <Button variant="link" onClick={() => navigate("/operations/transfers/new")}>
                  Create your first transfer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>From → To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.referenceNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{transfer.fromWarehouseName}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span>{transfer.toWarehouseName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(transfer.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{transfer.lines.length} items</TableCell>
                        <TableCell>
                          <StatusBadge status={transfer.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/operations/transfers/${transfer.id}`)}
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
