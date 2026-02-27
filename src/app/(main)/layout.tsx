import { Navbar } from "@/components/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-3 py-4 sm:px-5 sm:py-6">{children}</main>
    </div>
  );
}
