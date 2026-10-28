import { Archive, BadgeCheck, Building2, ClipboardList, FilePenLine, ShieldX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ListingStatusFilter } from "./useManageProperties";

const POST_PROPERTY_PATH = "/backend/properties/post-property";

const EMPTY_STATE_COPY: Record<
  ListingStatusFilter,
  { title: string; description: string; showPostCta: boolean }
> = {
  all: {
    title: "No properties yet",
    description: "Properties posted by users and the admin team will appear here.",
    showPostCta: false,
  },
  draft: {
    title: "No draft properties",
    description: "Drafts stay private until they are published. Start a listing or check back when new drafts are saved.",
    showPostCta: true,
  },
  pending: {
    title: "Nothing in review",
    description: "Properties submitted for review will appear here until they are approved or declined.",
    showPostCta: false,
  },
  published: {
    title: "No published listings",
    description: "Approved and published listings will appear here once they go live.",
    showPostCta: false,
  },
  rejected: {
    title: "No rejected listings",
    description: "Properties declined during review will appear here so you can track what was not approved.",
    showPostCta: false,
  },
  closed: {
    title: "No closed listings",
    description: "Listings that have been closed or marked inactive will appear here.",
    showPostCta: false,
  },
};

const ADMIN_EMPTY_STATE_COPY: Record<
  ListingStatusFilter,
  { title: string; description: string; showPostCta: boolean }
> = {
  all: {
    title: "No admin listings yet",
    description: "Properties posted from the admin panel will appear here.",
    showPostCta: true,
  },
  draft: {
    title: "No admin drafts",
    description: "Drafts saved by the admin team stay private until they are published.",
    showPostCta: true,
  },
  pending: {
    title: "Nothing in review",
    description: "Admin listings submitted for review will appear here until they are approved or declined.",
    showPostCta: false,
  },
  published: {
    title: "No published admin listings",
    description: "Live listings posted by the admin team will appear here.",
    showPostCta: false,
  },
  rejected: {
    title: "No rejected admin listings",
    description: "Admin listings declined during review will appear here.",
    showPostCta: false,
  },
  closed: {
    title: "No closed admin listings",
    description: "Admin listings that have been closed will appear here.",
    showPostCta: false,
  },
};

const EMPTY_STATE_VISUALS: Record<
  ListingStatusFilter,
  { icon: LucideIcon; iconWrap: string; iconColor: string }
> = {
  all: {
    icon: Building2,
    iconWrap: "bg-sky-50",
    iconColor: "text-navy-blue",
  },
  draft: {
    icon: FilePenLine,
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  pending: {
    icon: ClipboardList,
    iconWrap: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  published: {
    icon: BadgeCheck,
    iconWrap: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  rejected: {
    icon: ShieldX,
    iconWrap: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  closed: {
    icon: Archive,
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-600",
  },
};

type ManagePropertiesEmptyStateProps = {
  status: ListingStatusFilter;
  scope?: "manage" | "admin";
};

export default function ManagePropertiesEmptyState({ status, scope = "manage" }: ManagePropertiesEmptyStateProps) {
  const copy = scope === "admin" ? ADMIN_EMPTY_STATE_COPY[status] : EMPTY_STATE_COPY[status];
  const { title, description, showPostCta } = copy;
  const { icon: Icon, iconWrap, iconColor } = EMPTY_STATE_VISUALS[status];

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-16 text-center sm:py-20">
      <span
        className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${iconWrap}`}
      >
        <Icon className={`h-9 w-9 ${iconColor}`} strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {showPostCta ? (
        <Link
          href={POST_PROPERTY_PATH}
          className="bg-linear-to-r-navy-blue mt-6 inline-flex min-h-10 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          Post a property
        </Link>
      ) : null}
    </div>
  );
}
