import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { warehousesApi } from "@/api/warehouses";
import type { Warehouse, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WarehouseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contactInfo: "",
    isActive: true,
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocationName, setNewLocationName] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      loadWarehouse(id);
    }
  }, [id, isEditing]);

  const loadWarehouse = async (warehouseId: string) => {
    try {
      const warehouse = await warehousesApi.getWarehouse(warehouseId);
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        contactInfo: warehouse.contactInfo || "",
        isActive: warehouse.isActive,
      });
      setLocations(warehouse.locations);
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

  const handleAddLocation = () => {
    if (!newLocationName.trim()) return;

    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name: newLocationName.trim(),
      warehouseId: id || "",
    };

    setLocations([...locations, newLocation]);
    setNewLocationName("");
  };

  const handleRemoveLocation = (locationId: string) => {
    setLocations(locations.filter((loc) => loc.id !== locationId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const warehouseData: Omit<Warehouse, "id" | "createdAt"> = {
        ...formData,
        locations,
      };

      if (isEditing && id) {
        await warehousesApi.updateWarehouse(id, warehouseData);
        toast({
          title: "Success",
          description: "Warehouse updated successfully",
        });
        navigate(`/settings/warehouses/${id}`);
      } else {
        const newWarehouse = await warehousesApi.createWarehouse(warehouseData);
        toast({
          title: "Success",
          description: "Warehouse created successfully",
        });
        navigate(`/settings/warehouses/${newWarehouse.id}`);
      }
    } catch (error) {
      console.error("Failed to save warehouse:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} warehouse`,
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings/warehouses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Warehouse" : "Add New Warehouse"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update warehouse details" : "Create a new warehouse"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Warehouse Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Warehouse"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Warehouse Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g., WH-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter warehouse address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  placeholder="e.g., Phone, Email"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Location name (e.g., Zone A, Shelf 1)"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {locations.length > 0 ? (
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="font-medium">{location.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLocation(location.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No locations added yet
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/settings/warehouses")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update Warehouse" : "Create Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
