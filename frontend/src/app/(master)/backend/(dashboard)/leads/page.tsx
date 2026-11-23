import LeadsContent from "@/components/master/leads/LeadsContent";
import { getHighlightLeadId } from "@/components/master/leads/leadsShared";

type MasterLeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MasterLeadsPage({ searchParams }: MasterLeadsPageProps) {
  return <LeadsContent highlightLeadId={getHighlightLeadId(await searchParams)} />;
}
