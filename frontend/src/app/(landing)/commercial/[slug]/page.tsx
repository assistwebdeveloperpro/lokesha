import {
  LandingRoutePage,
  generateLandingMetadata,
  type LandingRouteProps,
} from "@/components/landing/home/LandingRoutePage";

const GROUP = "commercial";

export const generateMetadata = (props: LandingRouteProps) =>
  generateLandingMetadata(GROUP, props);

export default function CommercialLandingPage(props: LandingRouteProps) {
  return <LandingRoutePage group={GROUP} {...props} />;
}
