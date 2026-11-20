import { AlertTriangle, CheckCircle2, Clock, Info, XCircle } from "lucide-react";
import type { ComponentType } from "react";
import type { PaymentNotice, SubscriptionOverview } from "@/services/userSubscription.service";
import { plural } from "./subscriptionShared";

type Banner = {
  key: string;
  Icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  className: string;
  showBuyLink: boolean;
};

const TONES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 [&_svg]:text-emerald-600",
  warning: "border-amber-200 bg-amber-50 text-amber-900 [&_svg]:text-amber-600",
  danger: "border-red-200 bg-red-50 text-red-900 [&_svg]:text-red-600",
  info: "border-sky-200 bg-sky-50 text-sky-900 [&_svg]:text-sky-600",
};

function getNoticeBanner(notice: PaymentNotice): Banner {
  if (notice.type === "pending") {
    return {
      key: "pending",
      Icon: Clock,
      title: "Payment is being confirmed",
      text: `Order ${notice.orderNumber} is waiting for the bank. Your credits appear here as soon as it is confirmed.`,
      className: TONES.warning,
      showBuyLink: false,
    };
  }

  return {
    key: "failed",
    Icon: XCircle,
    title: "Your last payment failed",
    text: `Order ${notice.orderNumber} was not completed and nothing was kept. You can try again below.`,
    className: TONES.danger,
    showBuyLink: true,
  };
}

function getStateBanner({ summary }: SubscriptionOverview): Banner {
  switch (summary.state) {
    case "active":
      return {
        key: "active",
        Icon: CheckCircle2,
        title: "Your subscription is active",
        text: `You can publish ${plural(summary.submittableCredits, "more property", "more properties")} right now.`,
        className: TONES.success,
        showBuyLink: false,
      };
    case "low":
      return {
        key: "low",
        Icon: AlertTriangle,
        title: "You are running low on credits",
        text: `Only ${plural(summary.remainingCredits, "listing credit")} left. Buy the Standard package so your next property is not held up.`,
        className: TONES.warning,
        showBuyLink: true,
      };
    case "ended":
      return {
        key: "ended",
        Icon: XCircle,
        title: "You have no listing credits left",
        text: "Buy the Standard package to publish more properties. Your existing properties and leads are safe.",
        className: TONES.danger,
        showBuyLink: true,
      };
    default:
      return {
        key: "none",
        Icon: Info,
        title: "No active package",
        text: "Buy the Standard package to start publishing properties.",
        className: TONES.info,
        showBuyLink: true,
      };
  }
}

function BannerCard({ banner }: { banner: Banner }) {
  const { Icon, title, text, className, showBuyLink } = banner;

  return (
    <div role="status" className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border px-4 py-3.5 sm:px-5 ${className}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-sm font-medium opacity-90">{text}</p>
      </div>
      {showBuyLink ? (
        <a
          href="#buy-standard"
          className="inline-flex min-h-10 shrink-0 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Buy Standard
        </a>
      ) : null}
    </div>
  );
}

export default function SubscriptionStateBanner({ overview }: { overview: SubscriptionOverview }) {
  const banners = [overview.notice ? getNoticeBanner(overview.notice) : null, getStateBanner(overview)].filter(
    (banner): banner is Banner => banner !== null,
  );

  return (
    <div className="space-y-3">
      {banners.map((banner) => (
        <BannerCard key={banner.key} banner={banner} />
      ))}
    </div>
  );
}
