type FeaturedPossessionBadgeProps = {
  possessionDate: string;
};

// API sends "Dec'27"; the card reads "Possession from Dec 2027"
function formatPossessionLabel(possessionDate: string) {
  const [month, year] = possessionDate.split("'");
  if (!month || !year) return `Possession from ${possessionDate}`;
  return `Possession from ${month} ${year.length === 2 ? `20${year}` : year}`;
}

// Shown on hover for pointer devices and always on touch devices, which have no hover
export function FeaturedPossessionBadge({ possessionDate }: FeaturedPossessionBadgeProps) {
  return (
    <span className="pointer-events-none absolute right-3 top-3 z-10 flex translate-y-0 items-center gap-2 rounded-lg border border-white/60 bg-white/80 py-1.5 pl-2.5 pr-3.5 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md transition duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)]:-translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-visible:translate-y-0 [@media(hover:hover)]:group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
      </span>
      <span className="text-sky-700">{formatPossessionLabel(possessionDate)}</span>
    </span>
  );
}
