import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import type { DashboardKPIs, StockMovement, Product } from "@/types";
import { dashboardApi } from "@/api/dashboard";
import { stockMovementsApi } from "@/api/operations";
import { productsApi } from "@/api/products";

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentOperations, setRecentOperations] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [kpisData, movements, products] = await Promise.all([
          dashboardApi.getDashboardKPIs(),
          stockMovementsApi.getStockMovements(),
          productsApi.getProducts(),
        ]);

        setKpis(kpisData);
        setRecentOperations(movements.slice(0, 10));
        
        const lowStock = products.filter(
          (p) => p.totalStock > 0 && p.reorderLevel && p.totalStock <= p.reorderLevel
        );
        const outOfStock = products.filter((p) => p.totalStock === 0);
        setLowStockProducts([...outOfStock, ...lowStock]);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const kpiData = [
    {
      title: "Total Products",
      value: kpis?.totalProducts || 0,
      icon: Package,
      color: "blue",
      route: "/products",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Low Stock Items",
      value: kpis?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "amber",
      route: "/products?status=low-stock",
      highlight: (kpis?.lowStockItems || 0) > 0,
    },
    {
      title: "Out of Stock",
      value: kpis?.outOfStockItems || 0,
      icon: AlertCircle,
      color: "red",
      route: "/products?status=out-of-stock",
      highlight: (kpis?.outOfStockItems || 0) > 0,
    },
    {
      title: "Pending Receipts",
      value: kpis?.pendingReceipts || 0,
      icon: ArrowDownToLine,
      color: "green",
      route: "/operations/receipts?status=pending",
    },
    {
      title: "Pending Deliveries",
      value: kpis?.pendingDeliveries || 0,
      icon: ArrowUpFromLine,
      color: "purple",
      route: "/operations/deliveries?status=pending",
    },
    {
      title: "Scheduled Transfers",
      value: kpis?.scheduledTransfers || 0,
      icon: ArrowLeftRight,
      color: "indigo",
      route: "/operations/transfers?status=scheduled",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      red: "bg-red-500/10 text-red-600 border-red-500/20",
      green: "bg-green-500/10 text-green-600 border-green-500/20",
      purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time overview of your inventory operations
          </p>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = getColorClasses(kpi.color);
            
            return (
              <Card
                key={kpi.title}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                  kpi.highlight ? "border-amber-500/50 shadow-lg shadow-amber-500/10" : ""
                }`}
                onClick={() => navigate(kpi.route)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold tracking-tight">
                          {kpi.value}
                        </p>
                        {kpi.trend && (
                          <span className={`flex items-center text-sm font-medium ${
                            kpi.trendUp ? "text-green-600" : "text-red-600"
                          }`}>
                            {kpi.trendUp ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {kpi.trend}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-xl border transition-all duration-300 group-hover:scale-110 ${colorClasses}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Operations */}
          <Card className="lg:col-span-2 border-2 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Recent Stock Movements</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              {recentOperations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No recent operations</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stock movements will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">From/To</TableHead>
                        <TableHead className="text-right font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold">Warehouse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOperations.map((movement) => (
                        <TableRow
                          key={movement.id}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="whitespace-nowrap font-medium">
                            {format(new Date(movement.timestamp), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                              {movement.movementType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{movement.productName}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {movement.productSku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-0.5">
                              {movement.fromLocation && (
                                <p className="text-muted-foreground">
                                  From: <span className="font-medium">{movement.fromLocation}</span>
                                </p>
                              )}
                              {movement.toLocation && (
                                <p className="text-foreground">
                                  To: <span className="font-medium">{movement.toLocation}</span>
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${
                                movement.quantityChange > 0
                                  ? "bg-green-500/10 text-green-700"
                                  : "bg-red-500/10 text-red-700"
                              }`}
                            >
                              {movement.quantityChange > 0 ? "+" : ""}
                              {movement.quantityChange}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted">
                              {movement.warehouseName}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          {lowStockProducts.length > 0 && (
            <Card className="lg:col-span-2 border-2 border-amber-500/20 shadow-lg shadow-amber-500/5">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                    Items Needing Attention
                  </CardTitle>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-sm font-bold">
                    {lowStockProducts.length} items
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="text-right font-semibold">Current Stock</TableHead>
                        <TableHead className="text-right font-semibold">Reorder Level</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.slice(0, 5).map((product) => (
                        <TableRow
                          key={product.id}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {product.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted">
                              {product.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-lg">{product.totalStock}</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground font-medium">
                            {product.reorderLevel || "-"}
                          </TableCell>
                          <TableCell>
                            {product.totalStock === 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-700 border border-red-500/20">
                                <AlertCircle className="h-4 w-4" />
                                Out of Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                <AlertTriangle className="h-4 w-4" />
                                Low Stock
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}