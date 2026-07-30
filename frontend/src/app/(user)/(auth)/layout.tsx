import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthPageLayout from "@/components/auth/AuthPageLayout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col font-sans lg:h-dvh lg:overflow-hidden">
      <AuthHeader />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto scroll-py-6 lg:overflow-hidden">
        <AuthPageLayout>{children}</AuthPageLayout>
      </main>
      <AuthFooter />
    </div>
  );
}
