export const POST_PROPERTY_SECTION =
  "post-property-section group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-sky-50/35 p-5 ring-1 ring-slate-100/60 transition-all duration-300 hover:border-sky-200/70 sm:p-6";

export const POST_PROPERTY_SECTION_HEADER =
  "relative mb-5 flex items-start gap-3.5 border-b border-slate-100/90 pb-4 sm:gap-4";

export const POST_PROPERTY_SECTION_ACCENT =
  "mt-0.5 h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-sm shadow-sky-500/25";

export const POST_PROPERTY_SECTION_TITLE =
  "font-display text-base font-bold tracking-tight text-slate-800 sm:text-lg";

export const POST_PROPERTY_SECTION_DESC =
  "mt-1 text-sm font-medium leading-relaxed text-slate-500";

export const POST_PROPERTY_STEP_HEADER =
  "post-property-step-header mb-7 flex items-center gap-4 rounded-xl bg-gradient-to-r from-sky-50/90 via-white/80 to-transparent p-4 ring-1 ring-sky-100/70 sm:mb-8 sm:gap-5 sm:p-5";

export const POST_PROPERTY_STEP_ACCENT =
  "h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-sm shadow-sky-500/25";

export const POST_PROPERTY_STEP_TITLE =
  "font-display text-xl font-bold text-slate-800 sm:text-2xl";

export const POST_PROPERTY_STEP_DESC =
  "mt-0.5 text-sm font-medium text-slate-500";

export const POST_PROPERTY_CHIP_SELECTED =
  "border-sky-500 bg-gradient-to-br from-sky-50 to-sky-100/80 text-sky-800 shadow-sm ring-1 ring-sky-500/30";

export const POST_PROPERTY_CHIP_DEFAULT =
  "border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50/40 hover:text-slate-700";

export const POST_PROPERTY_TILE_SELECTED =
  "border-sky-500 bg-gradient-to-br from-sky-50 to-sky-100/70 text-sky-800 shadow-sm ring-1 ring-sky-500/30";

export const POST_PROPERTY_TILE_DEFAULT =
  "border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50/35 hover:text-slate-700";

export const POST_PROPERTY_CHECKBOX_ROW =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50/60 to-white px-4 py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-sky-200/80 hover:from-sky-50/50 hover:to-white hover:shadow-[0_4px_14px_rgba(14,165,233,0.1),0_2px_4px_rgba(15,23,42,0.05)]";

export const POST_PROPERTY_PRIMARY_BTN =
  "bg-linear-to-r-navy-blue inline-flex min-w-52 cursor-pointer items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:shadow-slate-900/30 active:scale-[0.99] sm:min-w-52";

export function postPropertyChipClass(isSelected: boolean) {
  return `inline-flex cursor-pointer items-center justify-center rounded-xl border font-semibold transition-all ${
    isSelected ? POST_PROPERTY_CHIP_SELECTED : POST_PROPERTY_CHIP_DEFAULT
  }`;
}

export function postPropertyTileClass(isSelected: boolean) {
  return `group transition-all hover:cursor-pointer ${
    isSelected ? POST_PROPERTY_TILE_SELECTED : POST_PROPERTY_TILE_DEFAULT
  }`;
}
