import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { deliveryOrdersApi } from "@/api/operations";
import type { DeliveryOrder } from "@/types";
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

export default function DeliveriesList() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [filteredDeliveryOrders, setFilteredDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadDeliveryOrders = async () => {
      try {
        const data = await deliveryOrdersApi.getDeliveryOrders();
        setDeliveryOrders(data || []);
        setFilteredDeliveryOrders(data || []);
      } catch (error) {
        console.error("Failed to load delivery orders:", error);
        setDeliveryOrders([]);
        setFilteredDeliveryOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveryOrders();
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
    if (!deliveryOrders) {
      setFilteredDeliveryOrders([]);
      return;
    }
    
    let filtered = [...deliveryOrders];

    if (statusFilter === "pending") {
      filtered = filtered.filter((d) => d.status === "waiting" || d.status === "draft");
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDeliveryOrders(filtered);
  }, [statusFilter, deliveryOrders]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Delivery Orders (Outgoing)</h1>
            <p className="text-muted-foreground">Manage outgoing stock deliveries</p>
          </div>
          <Button onClick={() => navigate("/operations/deliveries/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Delivery
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
            ) : filteredDeliveryOrders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No delivery orders found</p>
                <Button variant="link" onClick={() => navigate("/operations/deliveries/new")}>
                  Create your first delivery order
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveryOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.referenceNo}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.warehouseName}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(order.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{order.lines.length} items</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/operations/deliveries/${order.id}`)}
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
