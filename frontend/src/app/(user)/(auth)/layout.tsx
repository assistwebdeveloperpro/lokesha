import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthPageBackground from "@/components/auth/AuthPageBackground";
import AuthPageLayout from "@/components/auth/AuthPageLayout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#fcfeff] font-sans lg:h-dvh lg:overflow-hidden">
      <AuthHeader />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fcfeff] lg:overflow-hidden">
        <div className="relative isolate flex min-h-full w-full flex-1 flex-col lg:h-full">
          <AuthPageBackground />
          <div className="relative z-10 flex min-h-full w-full flex-1 flex-col lg:h-full">
            <AuthPageLayout>{children}</AuthPageLayout>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
