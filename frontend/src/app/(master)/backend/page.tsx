import { redirect } from "next/navigation";
import { MASTER_DEFAULT_ROUTE } from "@/components/master/layout/master-dashboard-nav";

export default function MasterIndexPage() {
  redirect(MASTER_DEFAULT_ROUTE);
}
