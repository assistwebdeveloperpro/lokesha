import { X } from "lucide-react";

export default function MediaRemoveButton({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white shadow-sm backdrop-blur-sm transition hover:bg-slate-900"
      aria-label={label}
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
