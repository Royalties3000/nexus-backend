interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 pb-6 mb-6">
      <h1 className="text-3xl font-black tracking-tighter text-white mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-400">{subtitle}</p>
      )}
    </header>
  );
}
