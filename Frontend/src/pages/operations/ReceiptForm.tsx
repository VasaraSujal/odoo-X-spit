import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { receiptsApi } from "@/api/operations";
import { productsApi } from "@/api/products";
import { warehousesApi } from "@/api/warehouses";
import type { Receipt, DocumentLine, Product, Warehouse, DocumentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReceiptForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [formData, setFormData] = useState({
    supplierName: "",
    warehouseId: "",
    warehouseName: "",
    date: new Date().toISOString().split("T")[0],
    status: "draft" as DocumentStatus,
    notes: "",
  });

  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [newLine, setNewLine] = useState({
    productId: "",
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadReceipt(id);
    }
  }, [id, isEditing]);

  const loadInitialData = async () => {
    try {
      const [productsData, warehousesData] = await Promise.all([
        productsApi.getProducts(),
        warehousesApi.getWarehouses({ isActive: true }),
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    }
  };

  const loadReceipt = async (receiptId: string) => {
    try {
      const receipt = await receiptsApi.getReceipt(receiptId);
      setFormData({
        supplierName: receipt.supplierName,
        warehouseId: receipt.warehouseId,
        warehouseName: receipt.warehouseName,
        date: receipt.date.split("T")[0],
        status: receipt.status,
        notes: receipt.notes || "",
      });
      setLines(receipt.lines);
    } catch (error) {
      console.error("Failed to load receipt:", error);
      toast({
        title: "Error",
        description: "Failed to load receipt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLine = () => {
    if (!newLine.productId) {
      toast({
        title: "Validation Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === newLine.productId);
    if (!product) return;

    const lineItem: DocumentLine = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: newLine.quantity,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: newLine.unitPrice,
    };

    setLines([...lines, lineItem]);
    setNewLine({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof DocumentLine, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setLines(updatedLines);
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (warehouse) {
      setFormData({
        ...formData,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierName) {
      toast({
        title: "Validation Error",
        description: "Please enter supplier name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.warehouseId) {
      toast({
        title: "Validation Error",
        description: "Please select a warehouse",
        variant: "destructive",
      });
      return;
    }

    if (lines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product line",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const receiptData: Omit<Receipt, "id" | "referenceNo" | "createdAt" | "updatedAt"> = {
        ...formData,
        lines,
      };

      if (isEditing && id) {
        await receiptsApi.updateReceipt(id, receiptData);
        toast({
          title: "Success",
          description: "Receipt updated successfully",
        });
        navigate(`/operations/receipts/${id}`);
      } else {
        const newReceipt = await receiptsApi.createReceipt(receiptData);
        toast({
          title: "Success",
          description: "Receipt created successfully",
        });
        navigate(`/operations/receipts/${newReceipt.id}`);
      }
    } catch (error: any) {
      console.error("Failed to save receipt:", error);
      const errorMessage = error?.message || `Failed to ${isEditing ? "update" : "create"} receipt`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = lines.reduce((sum, line) => sum + (line.quantity * (line.unitPrice || 0)), 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/operations/receipts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Receipt" : "Create Receipt"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update receipt details" : "Create a new incoming receipt"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      value={formData.supplierName}
                      onChange={(e) =>
                        setFormData({ ...formData, supplierName: e.target.value })
                      }
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Warehouse *</Label>
                    <Select
                      value={formData.warehouseId}
                      onValueChange={handleWarehouseChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: DocumentStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5 space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={newLine.productId}
                      onValueChange={(value) => setNewLine({ ...newLine, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newLine.quantity}
                      onChange={(e) =>
                        setNewLine({ ...newLine, quantity: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="col-span-3 space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newLine.unitPrice}
                      onChange={(e) =>
                        setNewLine({ ...newLine, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <Button type="button" onClick={handleAddLine} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {lines.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((line, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{line.productName}</TableCell>
                            <TableCell>{line.productSku}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={line.quantity}
                                onChange={(e) =>
                                  handleLineChange(index, "quantity", parseFloat(e.target.value) || 0)
                                }
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.unitPrice}
                                onChange={(e) =>
                                  handleLineChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                                }
                                className="w-32 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              ${((line.quantity || 0) * (line.unitPrice || 0)).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLine(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-semibold">
                            Total Amount:
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/operations/receipts")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : isEditing ? "Update Receipt" : "Create Receipt"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
