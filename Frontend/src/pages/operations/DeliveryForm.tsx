import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { deliveryOrdersApi } from "@/api/operations";
import { productsApi } from "@/api/products";
import { warehousesApi } from "@/api/warehouses";
import type { DeliveryOrder, DocumentLine, Product, Warehouse, DocumentStatus } from "@/types";
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

export default function DeliveryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [formData, setFormData] = useState({
    customerName: "",
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
      loadDeliveryOrder(id);
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

  const loadDeliveryOrder = async (orderId: string) => {
    try {
      const order = await deliveryOrdersApi.getDeliveryOrder(orderId);
      setFormData({
        customerName: order.customerName,
        warehouseId: order.warehouseId,
        warehouseName: order.warehouseName,
        date: order.date.split("T")[0],
        status: order.status,
        notes: order.notes || "",
      });
      setLines(order.lines);
    } catch (error) {
      console.error("Failed to load delivery order:", error);
      toast({
        title: "Error",
        description: "Failed to load delivery order details",
        variant: "destructive",
      });
      navigate("/operations/deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) return;

    setFormData({
      ...formData,
      warehouseId,
      warehouseName: warehouse.name,
    });
  };

  const handleAddLine = () => {
    if (!newLine.productId || newLine.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === newLine.productId);
    if (!product) return;

    const line: DocumentLine = {
      id: `line-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: newLine.quantity,
      unitOfMeasure: product.unitOfMeasure,
      unitPrice: newLine.unitPrice,
    };

    setLines([...lines, line]);
    setNewLine({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter((line) => line.id !== lineId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.warehouseId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (lines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product to deliver",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const deliveryData: Omit<DeliveryOrder, "id" | "referenceNo" | "createdAt" | "updatedAt"> = {
        ...formData,
        lines,
      };

      if (isEditing && id) {
        await deliveryOrdersApi.updateDeliveryOrder(id, deliveryData);
        toast({
          title: "Success",
          description: "Delivery order updated successfully",
        });
        navigate(`/operations/deliveries/${id}`);
      } else {
        const newOrder = await deliveryOrdersApi.createDeliveryOrder(deliveryData);
        toast({
          title: "Success",
          description: "Delivery order created successfully",
        });
        navigate(`/operations/deliveries/${newOrder.id}`);
      }
    } catch (error: any) {
      console.error("Failed to save delivery order:", error);
      const errorMessage = error?.message || `Failed to ${isEditing ? "update" : "create"} delivery order`;
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/operations/deliveries")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Delivery Order" : "Create Delivery Order"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update delivery order details" : "Create a new outgoing delivery"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="e.g., ABC Corporation"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">
                    Warehouse <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={handleWarehouseChange}
                    required
                  >
                    <SelectTrigger id="warehouse">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Delivery Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as DocumentStatus })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products to Deliver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
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
                <div>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={newLine.quantity}
                    onChange={(e) =>
                      setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={newLine.unitPrice}
                    onChange={(e) =>
                      setNewLine({ ...newLine, unitPrice: parseFloat(e.target.value) || 0 })
                    }
                  />
                  <Button type="button" onClick={handleAddLine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {lines.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>UoM</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">{line.productName}</TableCell>
                          <TableCell>{line.productSku}</TableCell>
                          <TableCell className="text-right">{line.quantity}</TableCell>
                          <TableCell>{line.unitOfMeasure}</TableCell>
                          <TableCell className="text-right">
                            ${(line.unitPrice || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${((line.quantity * (line.unitPrice || 0))).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLine(line.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-semibold">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No products added yet</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/operations/deliveries")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update Delivery" : "Create Delivery"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
