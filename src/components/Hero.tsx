type Props = { title: string; subtitle?: string; actions?: React.ReactNode };

export default function Hero({ title, subtitle, actions }: Props) {
  return (
    <header className="bg-gradient-to-r from-[#0b2a4a] to-[#0f3a70] text-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <h1 className="text-balance font-extrabold leading-tight text-[clamp(1.8rem,5vw,3rem)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm md:text-base/7 opacity-90">{subtitle}</p>
        )}
        {actions && <div className="mt-4">{actions}</div>}
      </div>
    </header>
  );
}
