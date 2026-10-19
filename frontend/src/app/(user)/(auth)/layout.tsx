import AuthFooter from "@/components/shared/auth/AuthFooter";
import AuthHeader from "@/components/shared/auth/AuthHeader";
import AuthPageBackground from "@/components/shared/auth/AuthPageBackground";
import AuthPageLayout from "@/components/shared/auth/AuthPageLayout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#fcfeff] font-sans">
      <AuthHeader />
      <main className="relative flex flex-1 flex-col bg-[#fcfeff]">
        <div className="relative isolate flex min-h-full w-full flex-1 flex-col">
          <AuthPageBackground />
          <div className="relative z-10 flex min-h-full w-full flex-1 flex-col">
            <AuthPageLayout>{children}</AuthPageLayout>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
