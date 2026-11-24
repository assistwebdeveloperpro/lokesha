"use client";

type CopyLinkFieldProps = {
  url: string;
  onCopy: () => void;
};

export function CopyLinkField({ url, onCopy }: CopyLinkFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white py-1 pl-4 pr-1">
      <input
        readOnly
        value={url}
        aria-label="Property link"
        onFocus={(event) => event.currentTarget.select()}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
      />
      <button
        type="button"
        onClick={onCopy}
        className="min-h-9 shrink-0 cursor-pointer rounded-full bg-navy-blue px-5 text-sm font-bold text-white transition hover:opacity-90"
      >
        Copy
      </button>
    </div>
  );
}
