import RequireProfileAccess from "@/components/auth/RequireProfileAccess";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireProfileAccess>{children}</RequireProfileAccess>;
}
