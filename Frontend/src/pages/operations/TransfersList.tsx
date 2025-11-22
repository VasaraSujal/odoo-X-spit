import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function TransfersList() {
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<InternalTransfer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        const data = await internalTransfersApi.getInternalTransfers();
        setTransfers(data);
        setFilteredTransfers(data);
      } catch (error) {
        console.error("Failed to load transfers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransfers();
  }, []);

  // Set initial status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "scheduled") {
      setStatusFilter("scheduled");
    }
  }, [searchParams]);

  // Apply status filter
  useEffect(() => {
    let filtered = [...transfers];

    if (statusFilter === "scheduled") {
      filtered = filtered.filter((t) => t.status === "waiting" || t.status === "ready");
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    setFilteredTransfers(filtered);
  }, [statusFilter, transfers]);

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
            <div className="mb-6 flex justify-end">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredTransfers.length === 0 ? (
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
                    {filteredTransfers.map((transfer) => (
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
