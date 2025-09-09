export function ScrollTabs({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex gap-2 overflow-x-auto scrollbar-none snap-x px-4 py-2 -mx-4">
      <div className="flex items-center gap-2">
        {children /* cada tab com className="shrink-0 snap-start" */}
      </div>
    </nav>
  );
}
