import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { internalTransfersApi } from "@/api/operations";
import { productsApi } from "@/api/products";
import { warehousesApi } from "@/api/warehouses";
import type { InternalTransfer, DocumentLine, Product, Warehouse, DocumentStatus } from "@/types";
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

export default function TransferForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fromWarehouse, setFromWarehouse] = useState<Warehouse | null>(null);
  const [toWarehouse, setToWarehouse] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    fromWarehouseId: "",
    fromWarehouseName: "",
    fromLocationId: "",
    fromLocationName: "",
    toWarehouseId: "",
    toWarehouseName: "",
    toLocationId: "",
    toLocationName: "",
    date: new Date().toISOString().split("T")[0],
    status: "draft" as DocumentStatus,
    notes: "",
  });

  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [newLine, setNewLine] = useState({
    productId: "",
    quantity: 1,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadTransfer(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.fromWarehouseId) {
      const warehouse = warehouses.find((w) => w.id === formData.fromWarehouseId);
      setFromWarehouse(warehouse || null);
    } else {
      setFromWarehouse(null);
    }
  }, [formData.fromWarehouseId, warehouses]);

  useEffect(() => {
    if (formData.toWarehouseId) {
      const warehouse = warehouses.find((w) => w.id === formData.toWarehouseId);
      setToWarehouse(warehouse || null);
    } else {
      setToWarehouse(null);
    }
  }, [formData.toWarehouseId, warehouses]);

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

  const loadTransfer = async (transferId: string) => {
    try {
      const transfer = await internalTransfersApi.getInternalTransfer(transferId);
      setFormData({
        fromWarehouseId: transfer.fromWarehouseId,
        fromWarehouseName: transfer.fromWarehouseName,
        fromLocationId: transfer.fromLocationId || "",
        fromLocationName: transfer.fromLocationName || "",
        toWarehouseId: transfer.toWarehouseId,
        toWarehouseName: transfer.toWarehouseName,
        toLocationId: transfer.toLocationId || "",
        toLocationName: transfer.toLocationName || "",
        date: transfer.date.split("T")[0],
        status: transfer.status,
        notes: transfer.notes || "",
      });
      setLines(transfer.lines);
    } catch (error) {
      console.error("Failed to load transfer:", error);
      toast({
        title: "Error",
        description: "Failed to load transfer details",
        variant: "destructive",
      });
      navigate("/operations/transfers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) return;

    setFormData({
      ...formData,
      fromWarehouseId: warehouseId,
      fromWarehouseName: warehouse.name,
      fromLocationId: "",
      fromLocationName: "",
    });
  };

  const handleToWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) return;

    setFormData({
      ...formData,
      toWarehouseId: warehouseId,
      toWarehouseName: warehouse.name,
      toLocationId: "",
      toLocationName: "",
    });
  };

  const handleFromLocationChange = (locationId: string) => {
    const location = fromWarehouse?.locations.find((l) => l.id === locationId);
    if (!location) return;

    setFormData({
      ...formData,
      fromLocationId: locationId,
      fromLocationName: location.name,
    });
  };

  const handleToLocationChange = (locationId: string) => {
    const location = toWarehouse?.locations.find((l) => l.id === locationId);
    if (!location) return;

    setFormData({
      ...formData,
      toLocationId: locationId,
      toLocationName: location.name,
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
    };

    setLines([...lines, line]);
    setNewLine({ productId: "", quantity: 1 });
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter((line) => line.id !== lineId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromWarehouseId || !formData.toWarehouseId) {
      toast({
        title: "Validation Error",
        description: "Please select both source and destination warehouses",
        variant: "destructive",
      });
      return;
    }

    if (formData.fromWarehouseId === formData.toWarehouseId) {
      toast({
        title: "Validation Error",
        description: "Source and destination warehouses must be different",
        variant: "destructive",
      });
      return;
    }

    if (lines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product to transfer",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const transferData: Omit<InternalTransfer, "id" | "referenceNo" | "createdAt" | "updatedAt"> = {
        ...formData,
        lines,
      };

      if (isEditing && id) {
        await internalTransfersApi.updateInternalTransfer(id, transferData);
        toast({
          title: "Success",
          description: "Transfer updated successfully",
        });
        navigate(`/operations/transfers/${id}`);
      } else {
        const newTransfer = await internalTransfersApi.createInternalTransfer(transferData);
        toast({
          title: "Success",
          description: "Transfer created successfully",
        });
        navigate(`/operations/transfers/${newTransfer.id}`);
      }
    } catch (error) {
      console.error("Failed to save transfer:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} transfer`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          <Button variant="ghost" size="icon" onClick={() => navigate("/operations/transfers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Transfer" : "Create Internal Transfer"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update transfer details" : "Move stock between warehouses"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Source</h3>
                  <div className="space-y-2">
                    <Label htmlFor="fromWarehouse">
                      From Warehouse <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.fromWarehouseId}
                      onValueChange={handleFromWarehouseChange}
                      required
                    >
                      <SelectTrigger id="fromWarehouse">
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

                  <div className="space-y-2">
                    <Label htmlFor="fromLocation">From Location</Label>
                    <Select
                      value={formData.fromLocationId}
                      onValueChange={handleFromLocationChange}
                      disabled={!fromWarehouse}
                    >
                      <SelectTrigger id="fromLocation">
                        <SelectValue placeholder="Select location (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {fromWarehouse?.locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Destination</h3>
                  <div className="space-y-2">
                    <Label htmlFor="toWarehouse">
                      To Warehouse <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.toWarehouseId}
                      onValueChange={handleToWarehouseChange}
                      required
                    >
                      <SelectTrigger id="toWarehouse">
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

                  <div className="space-y-2">
                    <Label htmlFor="toLocation">To Location</Label>
                    <Select
                      value={formData.toLocationId}
                      onValueChange={handleToLocationChange}
                      disabled={!toWarehouse}
                    >
                      <SelectTrigger id="toLocation">
                        <SelectValue placeholder="Select location (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {toWarehouse?.locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
              <CardTitle>Products to Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select value={newLine.productId} onValueChange={(value) => setNewLine({ ...newLine, productId: value })}>
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
                <div className="w-32">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newLine.quantity}
                    onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Button type="button" onClick={handleAddLine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
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
              onClick={() => navigate("/operations/transfers")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update Transfer" : "Create Transfer"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
