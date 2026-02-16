import Link from "next/link";

interface PriceInquiryProps {
  productName: string;
  sku: string;
  size?: "sm" | "lg";
}

export default function PriceInquiry({ productName, sku, size = "sm" }: PriceInquiryProps) {
  const subject = encodeURIComponent(`Cenas pieprasījums: ${sku} – ${productName}`);
  const mailtoLink = `mailto:info@hairsera.lv?subject=${subject}`;

  if (size === "lg") {
    return (
      <a
        href={mailtoLink}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-pink text-white text-sm font-semibold rounded-lg hover:bg-brand-pink/90 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Uzzināt vairāk par produktu
      </a>
    );
  }

  return (
    <span className="text-xs font-medium text-brand-pink">
      Uzzināt vairāk
    </span>
  );
}
