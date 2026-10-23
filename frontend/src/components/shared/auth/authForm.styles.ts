export const authFormCardClassName =
  "w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(15,23,42,0.06),0_18px_44px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.04] sm:rounded-2xl";

export const authFormBodyClassName =
  "p-3.5 max-[380px]:p-3 sm:p-5 lg:p-6";

export const authFormFieldsClassName = "mt-5 space-y-4 sm:mt-6 sm:space-y-[1.125rem]";

export const authFormSubmitClassName =
  "bg-navy-blue w-full cursor-pointer rounded-xl py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const authFormFooterClassName =
  "border-t border-slate-100 bg-slate-50/90 px-3.5 py-3.5 text-center max-[380px]:px-3 sm:px-5 lg:px-6";

export const authFormInlineLinkClassName =
  "font-semibold text-sky-700 transition-colors hover:text-sky-600";

export const authOtpDigitClassName = (hasError: boolean) =>
  [
    "h-12 w-11 rounded-lg border-2 bg-slate-50/60 text-center text-lg font-semibold text-slate-900 outline-none transition sm:h-[3.25rem] sm:w-12",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
      : "border-slate-200 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-500/15",
  ].join(" ");
