export default function DebugFab() {
  return (
    <button
      className="fixed right-4 md:right-6 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 rounded-full shadow-lg px-4 py-3 text-sm font-semibold bg-red-600 text-white"
      aria-label="Debug"
    >
      Debug
    </button>
  );
}
