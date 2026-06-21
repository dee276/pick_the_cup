import { useState } from "react";
import { useGetHighlights, getGetHighlightsQueryKey } from "@workspace/api-client-react";
import { Play, X, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function VideoModal({ videoId, title, onClose }: { videoId: string; title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
      data-testid="video-modal"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        data-testid="button-close-video"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      <p className="text-white text-sm font-medium mb-3 px-4 text-center">{title}</p>
      <div
        className="w-full max-w-2xl aspect-video px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          className="w-full h-full rounded-xl"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={title}
        />
      </div>
    </div>
  );
}

function HighlightCard({
  h,
  title,
  onClick,
}: {
  h: { id: number; videoId?: string | null; thumbnail?: string | null; group: string; homeFlag: string; homeTeam: string; awayTeam: string; awayFlag: string; scoreHome?: number | null; scoreAway?: number | null; date: string; youtubeUrl: string };
  title: string;
  onClick: () => void;
}) {
  const hasEmbed = !!h.videoId;
  return (
    <div
      className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-white shadow-sm active:scale-[0.97] transition-transform cursor-pointer"
      onClick={onClick}
      data-testid={`highlight-card-${h.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-24 md:h-32 bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] overflow-hidden">
        {h.thumbnail ? (
          <img
            src={h.thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 flex items-center justify-center">
            {hasEmbed ? (
              <Play className="w-4 h-4 md:w-5 md:h-5 text-[#DC2626] fill-[#DC2626] ml-0.5" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1E293B]" />
            )}
          </div>
        </div>
        <span className="absolute top-2 left-2 text-[9px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded">
          {h.group}
        </span>
        {hasEmbed && (
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#DC2626] text-white px-1.5 py-0.5 rounded">
            ▶ YT
          </span>
        )}
      </div>

      {/* Match info */}
      <div className="p-2.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-bold text-[#1E293B]">
            {h.homeFlag} {h.homeTeam.split(" ").pop()}
          </span>
          <span className="text-xs font-black text-[#1E293B] mx-1">
            {h.scoreHome ?? "?"} – {h.scoreAway ?? "?"}
          </span>
          <span className="text-xs font-bold text-[#1E293B]">
            {h.awayTeam.split(" ").pop()} {h.awayFlag}
          </span>
        </div>
        <p className="text-[10px] text-[#64748B]">
          {new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      </div>
    </div>
  );
}

export function HighlightsReel() {
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  const { data: highlights, isLoading } = useGetHighlights({
    query: { queryKey: getGetHighlightsQueryKey(), staleTime: 120_000 },
  });

  const title = (h: NonNullable<typeof highlights>[0]) =>
    `${h.homeFlag} ${h.homeTeam} ${h.scoreHome ?? "?"} – ${h.scoreAway ?? "?"} ${h.awayTeam} ${h.awayFlag}`;

  if (isLoading) {
    return (
      <section data-testid="highlights-reel">
        <h2 className="text-base font-bold text-[#1E293B] mb-3">⚡ Moments forts</h2>
        {/* Mobile: horizontal scroll skeleton */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-40 h-24 rounded-xl" />
          ))}
        </div>
        {/* Desktop: grid skeleton */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!highlights || highlights.length === 0) return null;

  return (
    <>
      <section data-testid="highlights-reel">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1E293B]">⚡ Moments forts</h2>
          <span className="text-xs text-[#64748B]">{highlights.length} matchs</span>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {highlights.map((h) => (
            <div key={h.id} className="flex-shrink-0 w-44">
              <HighlightCard
                h={h}
                title={title(h)}
                onClick={() =>
                  h.videoId
                    ? setActiveVideo({ id: h.videoId, title: title(h) })
                    : window.open(h.youtubeUrl, "_blank", "noopener")
                }
              />
            </div>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
          {highlights.map((h) => (
            <HighlightCard
              key={h.id}
              h={h}
              title={title(h)}
              onClick={() =>
                h.videoId
                  ? setActiveVideo({ id: h.videoId, title: title(h) })
                  : window.open(h.youtubeUrl, "_blank", "noopener")
              }
            />
          ))}
        </div>
      </section>

      {activeVideo && (
        <VideoModal
          videoId={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
