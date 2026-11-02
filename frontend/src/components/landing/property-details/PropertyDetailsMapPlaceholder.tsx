import { MapPin } from "lucide-react";

type PropertyDetailsMapPlaceholderProps = {
  title: string;
  address: string;
};

export function PropertyDetailsMapPlaceholder({
  title,
  address,
}: PropertyDetailsMapPlaceholderProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="relative flex h-42 items-center justify-center bg-linear-to-br from-sky-50 via-slate-100 to-sky-100 sm:h-46 md:h-66">
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-full bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px]" />
        </div>
        <div className="relative z-1 flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-white/80 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm sm:gap-2.5 sm:px-3.5">
          <MapPin className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <div className="min-w-0 text-left">
            <p className="line-clamp-1 text-xs font-semibold text-navy-blue sm:text-sm">{title}</p>
            <p className="line-clamp-1 text-[11px] text-slate-600 sm:text-xs">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
