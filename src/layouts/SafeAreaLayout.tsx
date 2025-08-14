export default function SafeAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[calc(84px+env(safe-area-inset-bottom))] bg-background text-foreground">
      {children}
    </div>
  );
}
