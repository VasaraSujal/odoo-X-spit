import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { receiptsApi } from "@/api/operations";
import type { Receipt } from "@/types";
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
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadReceipts = async () => {
      try {
        const data = await receiptsApi.getReceipts();
        setReceipts(data);
        setFilteredReceipts(data);
      } catch (error) {
        console.error("Failed to load receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReceipts();
  }, []);

  // Set initial status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "pending") {
      setStatusFilter("pending");
    }
  }, [searchParams]);

  // Apply status filter
  useEffect(() => {
    let filtered = [...receipts];

    if (statusFilter === "pending") {
      filtered = filtered.filter((r) => r.status === "waiting" || r.status === "draft");
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredReceipts(filtered);
  }, [statusFilter, receipts]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Receipts (Incoming Goods)</h1>
            <p className="text-muted-foreground">Manage incoming stock receipts</p>
          </div>
          <Button onClick={() => navigate("/operations/receipts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Receipt
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
                  <SelectItem value="pending">Pending</SelectItem>
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
            ) : filteredReceipts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No receipts found</p>
                <Button variant="link" onClick={() => navigate("/operations/receipts/new")}>
                  Create your first receipt
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.referenceNo}</TableCell>
                        <TableCell>{receipt.supplierName}</TableCell>
                        <TableCell>{receipt.warehouseName}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(receipt.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{receipt.lines.length} items</TableCell>
                        <TableCell>
                          <StatusBadge status={receipt.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/operations/receipts/${receipt.id}`)}
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
