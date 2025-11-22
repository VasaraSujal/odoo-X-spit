import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { productsApi } from "@/api/products";
import { stockMovementsApi } from "@/api/operations";
import type { Product, StockMovement } from "@/types";
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
import { ArrowLeft, Edit, Package, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!id) return;

    try {
      const [productData, movementsData] = await Promise.all([
        productsApi.getProduct(id),
        stockMovementsApi.getStockMovements({ productId: id }),
      ]);
      setProduct(productData);
      setMovements(movementsData.slice(0, 10));
    } catch (error) {
      console.error("Failed to load product:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await loadData();
      setIsLoading(false);
    };

    loadInitialData();
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

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="link" onClick={() => navigate("/products")}>
            Back to products
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.sku}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit of Measure</p>
                <p className="font-medium">{product.unitOfMeasure}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{product.totalStock}</p>
              </div>
              {product.reorderLevel && (
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Level</p>
                  <p className="font-medium">{product.reorderLevel}</p>
                </div>
              )}
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock by Location */}
          <Card>
            <CardHeader>
              <CardTitle>Stock by Location</CardTitle>
            </CardHeader>
            <CardContent>
              {product.stockByLocation.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No stock locations</p>
              ) : (
                <div className="space-y-3">
                  {product.stockByLocation.map((stock) => (
                    <div
                      key={`${stock.warehouseId}-${stock.locationId}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{stock.warehouseName}</p>
                        <p className="text-sm text-muted-foreground">{stock.locationName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{stock.quantity}</p>
                        <p className="text-xs text-muted-foreground">{product.unitOfMeasure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No movements recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From/To</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(movement.timestamp), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="capitalize">{movement.movementType}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {movement.fromLocation && (
                              <p className="text-muted-foreground">From: {movement.fromLocation}</p>
                            )}
                            {movement.toLocation && (
                              <p>To: {movement.toLocation}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={movement.quantityChange > 0 ? "text-success" : "text-destructive"}>
                            {movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.referenceDocumentType}
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
