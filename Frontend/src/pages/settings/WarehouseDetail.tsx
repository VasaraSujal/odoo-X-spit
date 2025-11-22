import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { warehousesApi } from "@/api/warehouses";
import type { Warehouse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadWarehouse = async () => {
      if (!id) return;
      
      try {
        const data = await warehousesApi.getWarehouse(id);
        setWarehouse(data);
      } catch (error) {
        console.error("Failed to load warehouse:", error);
        toast({
          title: "Error",
          description: "Failed to load warehouse details",
          variant: "destructive",
        });
        navigate("/settings/warehouses");
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouse();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await warehousesApi.deleteWarehouse(id);
      toast({
        title: "Success",
        description: "Warehouse deleted successfully",
      });
      navigate("/settings/warehouses");
    } catch (error) {
      console.error("Failed to delete warehouse:", error);
      toast({
        title: "Error",
        description: "Failed to delete warehouse",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

  if (!warehouse) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings/warehouses")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{warehouse.name}</h1>
              <p className="text-muted-foreground">Warehouse details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/settings/warehouses/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the warehouse
                    and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{warehouse.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code</label>
                <p className="text-lg">{warehouse.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {warehouse.isActive ? (
                    <Badge variant="default" className="bg-success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-lg">
                  {new Date(warehouse.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-lg">{warehouse.address}</p>
              </div>
              {warehouse.contactInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact</label>
                  <p className="text-lg">{warehouse.contactInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Locations ({warehouse.locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {warehouse.locations.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {warehouse.locations.map((location) => (
                  <div
                    key={location.id}
                    className="rounded-lg border p-3 hover:bg-accent transition-colors"
                  >
                    <p className="font-medium">{location.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No locations configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
