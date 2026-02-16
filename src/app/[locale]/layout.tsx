import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/translations";
import NavHeader from "@/components/NavHeader";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <div className="max-w-lg md:max-w-7xl mx-auto bg-brand-cream">
      <NavHeader locale={locale} />
      {children}
    </div>
  );
}
