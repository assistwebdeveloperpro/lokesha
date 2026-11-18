import LeadsContent from "@/components/user/dashboard/leads/LeadsContent";
import { getHighlightLeadId } from "@/components/user/dashboard/leads/leadsShared";

type LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  return <LeadsContent highlightLeadId={getHighlightLeadId(await searchParams)} />;
}
