import {
  LandingRoutePage,
  generateLandingMetadata,
  type LandingRouteProps,
} from "@/components/landing/home/LandingRoutePage";

const GROUP = "plots";

export const generateMetadata = (props: LandingRouteProps) =>
  generateLandingMetadata(GROUP, props);

export default function PlotsLandingPage(props: LandingRouteProps) {
  return <LandingRoutePage group={GROUP} {...props} />;
}
