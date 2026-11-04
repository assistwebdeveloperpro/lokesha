import Image from "next/image";
import Link from "next/link";
import postPropertyBanner from "../../../../../public/assets/images/banner-images/post-property-banner.png";

export function PropertySearchPostPropertyCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[6/3] w-full bg-slate-100">
        <Image
          src={postPropertyBanner}
          alt="Handing over house keys after listing a property for sale or rent"
          fill
          className="object-cover object-center"
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, 100vw"
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/20 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className="p-4">
        <h3 className="text-center text-base font-bold leading-snug text-slate-900">
          Sell/Rent Property
        </h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
        Sell or Rent your property faster than ever
        </p>
        <Link
          href="/post-property"
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg border-2 border-navy-blue bg-white text-sm font-semibold text-navy-blue transition hover:bg-slate-50"
        >
          Post property
        </Link>
      </div>
    </div>
  );
}
