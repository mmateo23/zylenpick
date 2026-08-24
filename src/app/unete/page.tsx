import { JoinSupportFunnel } from "@/components/join/join-support-funnel";
import { SiteShell } from "@/components/layout/site-shell";
import { getSiteFunnelSettings } from "@/features/funnel/services/site-funnel-service";
import { getSiteMediaAssetMap } from "@/features/site-media/services/site-media-service";

export default async function JoinPage() {
  const [siteMedia, funnelSettings] = await Promise.all([
    getSiteMediaAssetMap(),
    getSiteFunnelSettings(),
  ]);

  return (
    <SiteShell
      wideContent
      className="public-light-theme bg-page text-text-primary"
    >
      <main className="min-h-[calc(100svh-5rem)] bg-page px-5 py-8 text-text-primary sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <JoinSupportFunnel
            heroImageUrl={siteMedia.join_hero.imageUrl}
            pricing={funnelSettings.pricing}
          />
        </div>
      </main>
    </SiteShell>
  );
}
