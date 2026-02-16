export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-lg md:max-w-7xl mx-auto bg-brand-cream">
      {children}
    </div>
  );
}
