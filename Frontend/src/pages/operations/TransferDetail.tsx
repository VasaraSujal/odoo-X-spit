import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { internalTransfersApi } from "@/api/operations";
import type { InternalTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Package, Calendar, ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";

export default function TransferDetail() {
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<InternalTransfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTransfer = async () => {
      try {
        const data = await internalTransfersApi.getInternalTransfers();
        const foundTransfer = data.find((t) => t.id === id);
        setTransfer(foundTransfer || null);
      } catch (error) {
        console.error("Failed to load transfer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadTransfer();
    }
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!transfer) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Transfer Not Found</h2>
          <p className="text-muted-foreground mb-4">The transfer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/operations/transfers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transfers
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalQuantity = transfer.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/operations/transfers")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{transfer.referenceNo}</h1>
              <p className="text-muted-foreground">Internal Transfer Details</p>
            </div>
          </div>
          <StatusBadge status={transfer.status} />
        </div>

        {/* Transfer Route Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="text-2xl font-bold">{transfer.fromWarehouseName}</p>
                {transfer.fromLocationName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Location: {transfer.fromLocationName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-border w-16" />
                <ArrowRight className="h-8 w-8 text-primary" />
                <div className="h-px bg-border w-16" />
              </div>

              <div className="flex-1 text-right">
                <p className="text-sm text-muted-foreground mb-1">To</p>
                <p className="text-2xl font-bold">{transfer.toWarehouseName}</p>
                {transfer.toLocationName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Location: {transfer.toLocationName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transfer Date</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(transfer.date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-lg font-semibold">{transfer.lines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="text-lg font-semibold">{totalQuantity} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transfer Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.productName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {line.productSku}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {line.quantity}
                      </TableCell>
                      <TableCell>{line.unitOfMeasure}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{totalQuantity}</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid gap-4 md:grid-cols-2">
          {transfer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{transfer.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created At:</span>
                <span className="font-medium">
                  {format(new Date(transfer.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {format(new Date(transfer.updatedAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document ID:</span>
                <span className="font-mono text-sm">{transfer.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
