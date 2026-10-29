import { Building2, MapPin } from "lucide-react";
import type { FeaturedProperty } from "./featuredProperties.dummy";

export function FeaturedPropertyCard({
  title,
  locality,
  price,
  area,
  tag,
}: FeaturedProperty) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative flex h-40 items-center justify-center bg-linear-to-br from-sky-50 to-slate-100">
        <Building2 className="h-10 w-10 text-sky-300" aria-hidden />
        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-navy-blue shadow-sm">
          {tag}
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-sky-600" aria-hidden />
          {locality}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-navy-blue">{price}</span>
          <span className="text-xs font-medium text-slate-500">{area}</span>
        </div>
      </div>
    </article>
  );
}
