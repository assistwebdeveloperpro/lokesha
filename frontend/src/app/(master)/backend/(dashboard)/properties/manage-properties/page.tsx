import ManagePropertiesContent, { MASTER_MANAGE_TABS } from "@/components/master/manage-properties/ManagePropertiesContent";

export default function MasterManagePropertiesPage() {
  return <ManagePropertiesContent tabs={MASTER_MANAGE_TABS} initialStatus="all" allowListingActions={false} />;
}
