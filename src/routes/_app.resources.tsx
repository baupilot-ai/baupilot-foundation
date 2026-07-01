import { createFileRoute } from "@tanstack/react-router";
import { Hammer, Settings2, Package, Warehouse, Truck, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PageHeader title={t("resources.title")} description={t("resources.subtitle")} />
      <Tabs defaultValue="equipment" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="equipment"><Hammer className="h-4 w-4" />{t("resources.tabs.equipment")}</TabsTrigger>
            <TabsTrigger value="tools"><Settings2 className="h-4 w-4" />{t("resources.tabs.tools")}</TabsTrigger>
            <TabsTrigger value="materials"><Package className="h-4 w-4" />{t("resources.tabs.materials")}</TabsTrigger>
            <TabsTrigger value="inventory"><Warehouse className="h-4 w-4" />{t("resources.tabs.inventory")}</TabsTrigger>
            <TabsTrigger value="deliveries"><Truck className="h-4 w-4" />{t("resources.tabs.deliveries")}</TabsTrigger>
            <TabsTrigger value="maintenance"><Wrench className="h-4 w-4" />{t("resources.tabs.maintenance")}</TabsTrigger>
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
