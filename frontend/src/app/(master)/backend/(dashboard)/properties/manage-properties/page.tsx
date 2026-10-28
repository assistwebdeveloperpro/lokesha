import ManagePropertiesContent from "@/components/master/manage-properties/ManagePropertiesContent";

export default function MasterManagePropertiesPage() {
  return (
    <ManagePropertiesContent filterLayout="panel" initialStatus="all" allowListingActions={false} />
  );
}
