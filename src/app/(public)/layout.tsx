export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-4 h-14 flex items-center">
          <span className="text-lg font-bold tracking-tight">
            EchoTrail <span className="text-muted-foreground font-normal">Patch Notes</span>
          </span>
        </div>
      </header>
      <main className="px-3 py-4 sm:px-5 sm:py-6 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
