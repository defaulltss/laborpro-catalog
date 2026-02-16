interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-4 pt-6 pb-2 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">{title}</h1>
      {subtitle && (
        <p className="text-sm md:text-base text-brand-grey mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
