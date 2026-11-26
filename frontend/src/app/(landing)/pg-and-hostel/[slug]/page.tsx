import {
  LandingRoutePage,
  generateLandingMetadata,
  type LandingRouteProps,
} from "@/components/landing/home/LandingRoutePage";

const GROUP = "pg-and-hostel";

export const generateMetadata = (props: LandingRouteProps) =>
  generateLandingMetadata(GROUP, props);

export default function PgAndHostelLandingPage(props: LandingRouteProps) {
  return <LandingRoutePage group={GROUP} {...props} />;
}
