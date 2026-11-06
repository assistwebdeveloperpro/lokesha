import Image from "next/image";
import homeLoanBanner from "../../../../../public/assets/images/banner-images/get-your-home-loan-banner.png";

export function PropertySearchHomeLoanCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-6/3 w-full bg-slate-100">
        <Image
          src={homeLoanBanner}
          alt="Planning home loan payments with a calculator and budget notes"
          fill
          className="object-cover object-center"
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, 100vw"
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/25 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className="p-4">
        <h3 className="text-base text-center font-bold leading-snug text-slate-900">
          Get your home loan{" "}
          <span className="text-navy-blue">Quickly and Easily</span>
        </h3>
        <p className="mt-2 text-sm text-center leading-relaxed text-slate-600">
          Explore Our Home loan option and make your dream a reality.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-linear-to-r-navy-blue text-sm font-semibold text-white transition hover:cursor-pointer"
          >
            Check eligibility
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border-2 border-navy-blue bg-white text-sm font-semibold text-navy-blue transition hover:bg-slate-50"
          >
            EMI calculator
          </button>
        </div>
      </div>
    </div>
  );
}
