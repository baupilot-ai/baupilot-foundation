import { createFileRoute } from "@tanstack/react-router";
import { Hammer, Settings2, Package, Warehouse, Truck, Wrench } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentTab } from "@/components/resources/equipment-tab";
import { ToolsTab } from "@/components/resources/tools-tab";
import { MaterialsTab } from "@/components/resources/materials-tab";
import { InventoryTab } from "@/components/resources/inventory-tab";
import { DeliveriesTab } from "@/components/resources/deliveries-tab";
import { MaintenanceTab } from "@/components/resources/maintenance-tab";

export const Route = createFileRoute("/_app/resources")({
  ssr: false,
  head: () => ({ meta: [{ title: "Resources — BauPilot AI" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Equipment, tools, materials, inventory and deliveries."
      />
      <Tabs defaultValue="equipment" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="equipment"><Hammer className="h-4 w-4" />Equipment</TabsTrigger>
            <TabsTrigger value="tools"><Settings2 className="h-4 w-4" />Tools</TabsTrigger>
            <TabsTrigger value="materials"><Package className="h-4 w-4" />Materials</TabsTrigger>
            <TabsTrigger value="inventory"><Warehouse className="h-4 w-4" />Inventory</TabsTrigger>
            <TabsTrigger value="deliveries"><Truck className="h-4 w-4" />Deliveries</TabsTrigger>
            <TabsTrigger value="maintenance"><Wrench className="h-4 w-4" />Maintenance</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="equipment"><EquipmentTab /></TabsContent>
        <TabsContent value="tools"><ToolsTab /></TabsContent>
        <TabsContent value="materials"><MaterialsTab /></TabsContent>
        <TabsContent value="inventory"><InventoryTab /></TabsContent>
        <TabsContent value="deliveries"><DeliveriesTab /></TabsContent>
        <TabsContent value="maintenance"><MaintenanceTab /></TabsContent>
      </Tabs>
    </div>
  );
}
