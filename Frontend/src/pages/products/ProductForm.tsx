import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { productsApi } from "@/api/products";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const unitOptions = ["pieces", "kg", "liters", "meters", "boxes"];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitOfMeasure: "pieces",
    description: "",
    reorderLevel: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEdit);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await productsApi.getCategories();
        setCategories(categoriesData);

        if (isEdit && id) {
          const product = await productsApi.getProduct(id);
          setFormData({
            name: product.name,
            sku: product.sku,
            category: product.category,
            unitOfMeasure: product.unitOfMeasure,
            description: product.description || "",
            reorderLevel: product.reorderLevel?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && id) {
        await productsApi.updateProduct(id, {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unitOfMeasure: formData.unitOfMeasure,
          description: formData.description,
          reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
        });
        toast.success("Product updated successfully");
      } else {
        await productsApi.createProduct({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unitOfMeasure: formData.unitOfMeasure,
          description: formData.description,
          reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
        });
        toast.success("Product created successfully");
      }
      navigate("/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? "Edit Product" : "New Product"}</h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update product information" : "Add a new product to your catalog"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU / Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Parts">Parts</SelectItem>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select
                    value={formData.unitOfMeasure}
                    onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level (optional)</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="Minimum stock level"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
