import AuthPromoContent from "@/components/shared/auth/AuthPromoContent";


const AUTH_FORM_MIN_H_LG =
  "lg:min-h-[calc(100dvh-4rem-5.25rem)]";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-4 sm:gap-6 lg:h-full lg:min-h-0 lg:flex-row lg:gap-0">
      <aside className="relative flex w-full shrink-0 flex-col lg:h-full lg:w-[44%] lg:min-h-0 xl:w-[46%]">
        <div className="auth-panel-body relative flex flex-col px-3 pt-5 pb-0 max-[380px]:px-2.5 sm:px-5 sm:pt-7 md:px-6 md:pt-8 lg:h-full lg:min-h-0 lg:justify-center lg:overflow-y-auto lg:px-8 lg:py-10 xl:px-12 xl:py-12">
          <AuthPromoContent />
        </div>
      </aside>

      <section
        className={`grid w-full shrink-0 place-items-stretch px-3 pb-6 pt-0 max-[380px]:px-2.5 sm:place-items-start sm:px-5 sm:pb-8 md:px-6 lg:h-full lg:min-h-0 lg:flex-1 lg:place-items-center lg:overflow-y-auto lg:px-8 lg:py-10 ${AUTH_FORM_MIN_H_LG}`}
      >
        {children}
      </section>
    </div>
  );
}
