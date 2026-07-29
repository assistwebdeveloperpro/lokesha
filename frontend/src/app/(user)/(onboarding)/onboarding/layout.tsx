import Header from "@/components/layout/Header";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 font-sans">
      <Header />
      <main className="flex-1 bg-zinc-100">{children}</main>
    </div>
  );
}
