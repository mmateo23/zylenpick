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
      <div className="min-w-0">
        <JoinSupportFunnel
          heroImageUrl={siteMedia.join_hero.imageUrl}
          planImageUrls={{
            free_presence: siteMedia.join_plan_free.imageUrl,
            improve_presence: siteMedia.join_plan_presence.imageUrl,
            more_visibility: siteMedia.join_plan_visibility.imageUrl,
            guided_growth: siteMedia.join_plan_growth.imageUrl,
          }}
          showcaseImageUrl={siteMedia.join_showcase.imageUrl}
          pricing={funnelSettings.pricing}
        />
      </div>
    </SiteShell>
  );
}
