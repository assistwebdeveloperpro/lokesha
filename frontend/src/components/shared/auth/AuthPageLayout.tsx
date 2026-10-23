import AuthPromoContent from "@/components/shared/auth/AuthPromoContent";

export default function AuthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col lg:flex-row lg:items-stretch">
      <aside className="relative hidden w-full shrink-0 flex-col lg:flex lg:w-[44%] xl:w-[46%]">
        <div className="auth-panel-body relative flex flex-1 flex-col justify-center px-8 py-10 xl:px-12 xl:py-12">
          <AuthPromoContent />
        </div>
      </aside>

      <section className="grid w-full flex-1 justify-items-center px-3 py-8 max-[380px]:px-2.5 sm:px-5 sm:py-10 md:px-6 lg:place-items-center lg:px-8 lg:py-10">
        {children}
      </section>
    </div>
  );
}
