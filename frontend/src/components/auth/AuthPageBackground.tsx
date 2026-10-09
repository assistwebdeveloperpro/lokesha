import type { StaticImageData } from "next/image";
import authBgPattern from "../../../public/assets/images/auth/auth-bg-pattern.svg";

function assetSrc(asset: StaticImageData | string): string {
  return typeof asset === "string" ? asset : asset.src;
}

const PATTERN_LAYER_OPACITY = 0.52;
const SKY_VEIL_OPACITY = 0.14;

export default function AuthPageBackground() {
  const patternUrl = assetSrc(authBgPattern);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 min-h-full w-full"
      aria-hidden
    >
      <div className="absolute inset-0 min-h-full bg-[#fcfeff]" />
      <div
        className="absolute inset-0 min-h-full"
        style={{
          backgroundImage:
            "linear-gradient(160deg, #fcfeff 0%, #f8fcff 45%, #f6fbff 100%)",
        }}
      />
      <div
        className="absolute inset-0 min-h-full"
        style={{
          opacity: PATTERN_LAYER_OPACITY,
          backgroundImage: `url("${patternUrl}")`,
          backgroundSize: "120px 120px",
          backgroundRepeat: "repeat",
        }}
      />
      <div
        className="absolute inset-0 min-h-full bg-[#fcfeff]"
        style={{ opacity: SKY_VEIL_OPACITY }}
      />
    </div>
  );
}
