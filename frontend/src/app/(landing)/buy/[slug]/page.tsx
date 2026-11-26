import {
  LandingRoutePage,
  generateLandingMetadata,
  type LandingRouteProps,
} from "@/components/landing/home/LandingRoutePage";

const GROUP = "buy";

export const generateMetadata = (props: LandingRouteProps) =>
  generateLandingMetadata(GROUP, props);

export default function BuyLandingPage(props: LandingRouteProps) {
  return <LandingRoutePage group={GROUP} {...props} />;
}
