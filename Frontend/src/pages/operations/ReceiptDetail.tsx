import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { receiptsApi } from "@/api/operations";
import type { Receipt } from "@/types";
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
import { ArrowLeft, Package, Calendar, MapPin, FileText, User } from "lucide-react";
import { format } from "date-fns";

export default function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const data = await receiptsApi.getReceipts();
        const foundReceipt = data.find((r) => r.id === id);
        setReceipt(foundReceipt || null);
      } catch (error) {
        console.error("Failed to load receipt:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadReceipt();
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

  if (!receipt) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Receipt Not Found</h2>
          <p className="text-muted-foreground mb-4">The receipt you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/operations/receipts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalQuantity = receipt.lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalValue = receipt.lines.reduce((sum, line) => sum + (line.quantity * (line.unitPrice || 0)), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/operations/receipts")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{receipt.referenceNo}</h1>
              <p className="text-muted-foreground">Receipt Details</p>
            </div>
          </div>
          <StatusBadge status={receipt.status} />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="text-lg font-semibold">{receipt.supplierName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warehouse</p>
                  <p className="text-lg font-semibold">{receipt.warehouseName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receipt Date</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(receipt.date), "MMM dd, yyyy")}
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
                  <p className="text-lg font-semibold">{receipt.lines.length}</p>
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
              Receipt Items
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
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.productName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {line.productSku}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {line.quantity}
                      </TableCell>
                      <TableCell>{line.unitOfMeasure}</TableCell>
                      <TableCell className="text-right">
                        ${(line.unitPrice || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${((line.unitPrice || 0) * line.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{totalQuantity}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">${totalValue.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid gap-4 md:grid-cols-2">
          {receipt.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{receipt.notes}</p>
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
                  {format(new Date(receipt.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {format(new Date(receipt.updatedAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document ID:</span>
                <span className="font-mono text-sm">{receipt.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
