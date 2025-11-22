import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { stockAdjustmentsApi } from "@/api/operations";
import { productsApi } from "@/api/products";
import { warehousesApi } from "@/api/warehouses";
import type { StockAdjustment, Product, Warehouse, DocumentStatus } from "@/types";
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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdjustmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    warehouseId: "",
    warehouseName: "",
    locationId: "",
    locationName: "",
    reason: "",
    systemQuantity: 0,
    countedQuantity: 0,
    date: new Date().toISOString().split("T")[0],
    status: "draft" as DocumentStatus,
    notes: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadAdjustment(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.warehouseId) {
      const warehouse = warehouses.find((w) => w.id === formData.warehouseId);
      setSelectedWarehouse(warehouse || null);
    } else {
      setSelectedWarehouse(null);
    }
  }, [formData.warehouseId, warehouses]);

  useEffect(() => {
    if (formData.productId && formData.locationId) {
      updateSystemQuantity();
    }
  }, [formData.productId, formData.locationId]);

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

  const loadAdjustment = async (adjustmentId: string) => {
    try {
      const adjustment = await stockAdjustmentsApi.getStockAdjustment(adjustmentId);
      setFormData({
        productId: adjustment.productId,
        productName: adjustment.productName,
        warehouseId: adjustment.warehouseId,
        warehouseName: adjustment.warehouseName,
        locationId: adjustment.locationId,
        locationName: adjustment.locationName,
        reason: adjustment.reason,
        systemQuantity: adjustment.systemQuantity,
        countedQuantity: adjustment.countedQuantity,
        date: adjustment.date.split("T")[0],
        status: adjustment.status,
        notes: adjustment.notes || "",
      });
    } catch (error) {
      console.error("Failed to load adjustment:", error);
      toast({
        title: "Error",
        description: "Failed to load adjustment details",
        variant: "destructive",
      });
      navigate("/operations/adjustments");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSystemQuantity = () => {
    const product = products.find((p) => p.id === formData.productId);
    if (!product) return;

    const stock = product.stockByLocation.find(
      (s) => s.locationId === formData.locationId
    );
    
    setFormData((prev) => ({
      ...prev,
      systemQuantity: stock?.quantity || 0,
    }));
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setFormData({
      ...formData,
      productId,
      productName: product.name,
      locationId: "",
      locationName: "",
      systemQuantity: 0,
    });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) return;

    setFormData({
      ...formData,
      warehouseId,
      warehouseName: warehouse.name,
      locationId: "",
      locationName: "",
      systemQuantity: 0,
    });
  };

  const handleLocationChange = (locationId: string) => {
    const location = selectedWarehouse?.locations.find((l) => l.id === locationId);
    if (!location) return;

    setFormData({
      ...formData,
      locationId,
      locationName: location.name,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.warehouseId || !formData.locationId || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const difference = formData.countedQuantity - formData.systemQuantity;
      
      const adjustmentData: Omit<StockAdjustment, "id" | "referenceNo" | "createdAt" | "updatedAt"> = {
        ...formData,
        difference,
      };

      if (isEditing && id) {
        await stockAdjustmentsApi.updateStockAdjustment(id, adjustmentData);
        toast({
          title: "Success",
          description: "Adjustment updated successfully",
        });
        navigate(`/operations/adjustments/${id}`);
      } else {
        const newAdjustment = await stockAdjustmentsApi.createStockAdjustment(adjustmentData);
        toast({
          title: "Success",
          description: "Adjustment created successfully",
        });
        navigate(`/operations/adjustments/${newAdjustment.id}`);
      }
    } catch (error) {
      console.error("Failed to save adjustment:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} adjustment`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const difference = formData.countedQuantity - formData.systemQuantity;

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
          <Button variant="ghost" size="icon" onClick={() => navigate("/operations/adjustments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Adjustment" : "Create Stock Adjustment"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update stock adjustment details" : "Record a stock count correction"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product">
                    Product <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.productId}
                    onValueChange={handleProductChange}
                    required
                  >
                    <SelectTrigger id="product">
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.locationId}
                    onValueChange={handleLocationChange}
                    disabled={!selectedWarehouse}
                    required
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedWarehouse?.locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reason"
                  placeholder="e.g., Physical count correction, Damaged goods"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="systemQuantity">System Quantity</Label>
                  <Input
                    id="systemQuantity"
                    type="number"
                    value={formData.systemQuantity}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countedQuantity">
                    Counted Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="countedQuantity"
                    type="number"
                    min="0"
                    value={formData.countedQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, countedQuantity: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difference</Label>
                  <Input
                    type="text"
                    value={difference > 0 ? `+${difference}` : difference}
                    disabled
                    className={`bg-muted font-medium ${
                      difference > 0 ? "text-success" : difference < 0 ? "text-destructive" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as DocumentStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/operations/adjustments")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update Adjustment" : "Create Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
