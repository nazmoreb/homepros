import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="contents">
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
