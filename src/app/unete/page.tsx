import { JoinSupportFunnel } from "@/components/join/join-support-funnel";
import { SiteShell } from "@/components/layout/site-shell";

export default function JoinPage() {
  return (
    <SiteShell
      wideContent
      showBasicFooter={false}
      className="public-light-theme bg-page text-text-primary"
    >
      <main className="min-h-[calc(100svh-5rem)] bg-page px-5 py-8 text-text-primary sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <JoinSupportFunnel />
        </div>
      </main>
    </SiteShell>
  );
}
