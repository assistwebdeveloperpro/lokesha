import {
  LandingRoutePage,
  generateLandingMetadata,
  type LandingRouteProps,
} from "@/components/landing/home/LandingRoutePage";

const GROUP = "lands";

export const generateMetadata = (props: LandingRouteProps) =>
  generateLandingMetadata(GROUP, props);

export default function LandsLandingPage(props: LandingRouteProps) {
  return <LandingRoutePage group={GROUP} {...props} />;
}
