"use client";

import {
  Building2,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Smartphone,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const BUYERS = [
  {
    name: "Manoj Kumar",
    budget: "₹ 45 - 50 Lac",
    searchingSince: "Within 6 Months",
  },
  {
    name: "Margoob Khan",
    budget: "₹ 50 - 55 Lac",
    searchingSince: "Within 6 Months",
  },
  {
    name: "Vipin Uniyal",
    budget: "₹ 1.5 - 1.75 Cr",
    searchingSince: "Within 3 Months",
  },
  {
    name: "Priya Sharma",
    budget: "₹ 60 - 70 Lac",
    searchingSince: "Within 3 Months",
  },
  {
    name: "Rahul Mehta",
    budget: "₹ 80 - 90 Lac",
    searchingSince: "Within 6 Months",
  },
];

const TRIAL_FEATURES = [
  "Get Instant Visibility",
  "Maximize your Leads",
  "Close more Deals",
  "Grow your Business",
];

const STEPS = [
  {
    step: "Step 1",
    title: "Post your Property",
    description:
      "Become Visible to 12 Lac Buyers Who Are Actively Looking for Properties",
    icon: Building2,
  },
  {
    step: "Step 2",
    title: "Add Genuine Photos & Info",
    description: "Genuine Listings Get Higher Reach & More Responses",
    icon: Camera,
  },
  {
    step: "Step 3",
    title: "Self-Verify Your Property",
    description:
      "Use our Mobile App to Self Verify your Property & Get 3X More Leads",
    icon: Smartphone,
  },
];

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full w-full max-w-sm text-slate-300"
      aria-hidden
    >
      <path
        d="M40 130 L160 50 L280 130"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="80"
        y="90"
        width="160"
        height="80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="130"
        y="120"
        width="40"
        height="50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="200"
        y="110"
        width="25"
        height="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="60" cy="130" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="260" cy="130" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="110" x2="60" y2="90" stroke="currentColor" strokeWidth="2" />
      <line x1="260" y1="110" x2="260" y2="90" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function OrBadge() {
  return (
    <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900 shadow-md">
      OR
    </div>
  );
}

function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-sky-700 underline decoration-sky-700 underline-offset-2 transition hover:text-sky-600"
    >
      {children}
    </Link>
  );
}

function BuyerCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -280 : 280;
    el.scrollBy({ left: amount, behavior: "smooth" });
    window.setTimeout(updateScrollState, 300);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:-left-5 sm:h-10 sm:w-10"
        aria-label="Previous buyers"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BUYERS.map((buyer) => (
          <article
            key={buyer.name}
            className="min-w-[220px] shrink-0 rounded-lg border border-slate-200 bg-white p-4 sm:min-w-[240px]"
          >
            <h4 className="font-semibold text-slate-900">{buyer.name}</h4>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Budget</dt>
                <dd className="font-semibold text-slate-900">{buyer.budget}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Searching Since</dt>
                <dd className="font-medium text-slate-800">
                  {buyer.searchingSince}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:-right-5 sm:h-10 sm:w-10"
        aria-label="Next buyers"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-100 pb-12">
      {/* Welcome hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-zinc-100">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 items-center justify-end pr-8 opacity-60 lg:flex">
          <HeroIllustration />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            Welcome Onboard!
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            50K Owners &amp; 12 Lac Buyers are Waiting for You!
          </p>
          <Link
            href="/user/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-sky-700 underline decoration-sky-700 underline-offset-4 transition hover:text-sky-600"
          >
            Go to My Dashboard
          </Link>
        </div>
      </section>

      {/* Main onboarding card */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Maximize Your Leads with 4 Simple Steps
          </h2>

          {/* Trial pack / iAdvantage row */}
          <div className="relative mt-6 grid gap-4 md:grid-cols-2">
            <OrBadge />

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <IndianRupee className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-semibold text-slate-900">Buy a Trial Pack</h3>
              </div>
              <p className="mt-3 max-w-[400px] text-sm text-sky-700 border border-dashed p-2 rounded-sm border-sky-700">
                Save up to Rs.1000 on your first purchase. <br />
                <span className="font-semibold uppercase pt-2">Limited time offer</span>
              </p>
              <div className="mt-4">
                <ActionLink href="/user/subscription/subscribed-services">
                  View All Packs
                </ActionLink>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <UserPlus className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-semibold text-slate-900">Try iAdvantage</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600 border p-2 rounded-sm border-sky-600">
                Get quick and direct access to the leads looking for property
                similar to yours.
              </p>
              <div className="mt-4">
                <ActionLink href="/user/contacts/active-buyers">
                  View All Packs
                </ActionLink>
              </div>
            </div>
          </div>

          {/* Steps row */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ step, title, description, icon: Icon }) => (
              <article
                key={step}
                className="relative rounded-lg border border-slate-200 bg-zinc-50 p-5"
              >
                <span className="absolute right-3 top-3 rounded bg-navy-blue px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {step}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 pr-16 font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
                <div className="mt-4">
                  <ActionLink href="/user/properties/post-new-properties">
                    Buy Now
                  </ActionLink>
                </div>
              </article>
            ))}
          </div>

          {/* Buyer insights */}
          <section className="mt-10 border-t border-slate-100 pt-8">
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              6000 Buyers are Looking for a Property in Bangalore
            </h3>
            <p className="mt-1 text-slate-500">
              Reach out to Them Before Other Agents Do
            </p>

            <div className="mt-6">
              <BuyerCarousel />
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/user/contacts/active-buyers"
                className="inline-flex h-11 items-center justify-center rounded-md bg-linear-to-r-navy-blue px-8 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Connect Now
              </Link>
              <p className="text-sm text-slate-600">
                Your Welcome Gift:{" "}
                <span className="font-semibold text-lokesha-emerald">
                  Get One Time Discount of Rs.15450
                </span>
              </p>
            </div>
          </section>

          {/* Trial pack banner */}
          <section className="mt-10 rounded-lg border-2 border-dashed border-sky-300 bg-sky-50/60 p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Buy a Trial Pack
                </h3>
                <p className="mt-1 text-sm italic text-slate-600">
                  Get up to Rs. 15450 off Your First Purchase
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {TRIAL_FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <Check
                        className="h-4 w-4 shrink-0 text-lokesha-emerald"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/user/subscription/subscribed-services"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-linear-to-r-navy-blue px-8 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Buy Now
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
