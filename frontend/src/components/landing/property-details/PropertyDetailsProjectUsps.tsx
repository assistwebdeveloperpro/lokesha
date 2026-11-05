import { Play } from "lucide-react";

type PropertyDetailsProjectUspsProps = {
  items: string[];
};

export function PropertyDetailsProjectUsps({ items }: PropertyDetailsProjectUspsProps) {
  return (
    <ul className="space-y-3">
      {items.map((text, index) => (
        <li key={`${index}-${text}`} className="flex items-start gap-2.5">
          <Play
            className="mt-1 h-3.5 w-3.5 shrink-0 fill-sky-600 text-sky-600"
            aria-hidden
          />
          <span className="text-sm leading-snug text-slate-700 sm:text-sm">{text}</span>
        </li>
      ))}
    </ul>
  );
}
