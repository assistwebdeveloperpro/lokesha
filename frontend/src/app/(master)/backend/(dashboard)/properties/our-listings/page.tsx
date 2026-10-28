import ManagePropertiesContent, {
  OUR_LISTING_TABS,
} from "@/components/master/manage-properties/ManagePropertiesContent";

export default function MasterOurListingsPage() {
  return (
    <ManagePropertiesContent
      title="Our Listings"
      description="Properties posted by the admin team."
      source="admin"
      tabs={OUR_LISTING_TABS}
      initialStatus="all"
      showSourceBadge={false}
      showOwnerDetails={false}
      showPropertyCount={false}
    />
  );
}
