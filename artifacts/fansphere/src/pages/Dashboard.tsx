import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { HighlightsReel } from "@/components/HighlightsReel";

function MatchCard({ match }: { match: NonNullable<ReturnType<typeof useGetDashboard>["data"]>["todayMatches"][0] }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  return (
    <Link href={`/match/${match.id}`} className="block">
      <Card className="p-4 bg-white border border-[#E2E8F0] shadow-sm active:scale-[0.98] transition-transform hover:bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{match.teamA.flag}</span>
            <span className="text-sm font-bold text-[#1E293B]">{match.teamA.code}</span>
          </div>
          <div className="flex flex-col items-center min-w-[72px]">
            {isLive || isFinished ? (
              <>
                <span className="text-lg font-black text-[#1E293B]">{match.scoreA} – {match.scoreB}</span>
                {isLive && <span className="text-[9px] font-bold text-[#DC2626] animate-pulse">EN DIRECT</span>}
                {isFinished && <span className="text-[9px] font-medium text-[#64748B]">TERMINÉ</span>}
              </>
            ) : (
              <span className="text-sm font-bold text-[#64748B]">
                {format(new Date(match.datetime), "HH:mm", { locale: fr })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-bold text-[#1E293B]">{match.teamB.code}</span>
            <span className="text-2xl">{match.teamB.flag}</span>
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-[10px] text-[#94A3B8] font-medium">Groupe {match.group}</span>
        </div>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), staleTime: 30_000 },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-0 space-y-6">
        <div className="hidden md:block">
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const featured = dashboard.featuredMatch;
  const isLive = featured?.status === "live";
  const isFinished = featured?.status === "finished";

  return (
    <div className="p-4 md:p-0 space-y-6">
      {/* Header — desktop only (mobile header is implied) */}
      <header className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E293B]">PickTheCup 🏆</h1>
          <p className="text-[#64748B] text-sm mt-0.5">Coupe du Monde 2026 · Données officielles</p>
        </div>
        {isLive && (
          <Badge className="hidden md:flex bg-[#DC2626] text-white border-0 animate-pulse text-sm font-bold px-3 py-1.5">
            🔴 Match en direct
          </Badge>
        )}
      </header>

      {/* ── Two-column layout on md+ ── */}
      <div className="md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-[1fr_380px] space-y-6 md:space-y-0">

        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* Featured Match */}
          {featured && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#1E293B]">Match en vedette</h2>
                {isLive && (
                  <Badge className="bg-[#DC2626] text-white border-0 animate-pulse text-xs font-bold px-2 py-0.5">
                    EN DIRECT
                  </Badge>
                )}
                {isFinished && <span className="text-xs text-[#64748B] font-medium">Terminé</span>}
              </div>
              <Link href={`/match/${featured.id}`} className="block">
                <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl p-6 md:p-8 shadow-lg active:scale-[0.98] transition-transform">
                  <div className="text-center text-xs font-semibold text-white/70 mb-5">
                    Groupe {featured.group} · {featured.stadium ?? ""}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-5xl md:text-6xl">{featured.teamA.flag}</span>
                      <span className="text-white font-bold text-sm md:text-base">{featured.teamA.name}</span>
                    </div>
                    <div className="flex-1 text-center">
                      {isLive || isFinished ? (
                        <div className="bg-black/20 rounded-xl px-4 py-3 inline-block">
                          <span className="text-4xl md:text-5xl font-black text-white">
                            {featured.scoreA} – {featured.scoreB}
                          </span>
                        </div>
                      ) : (
                        <div className="text-white/80 text-xl font-bold">
                          {format(new Date(featured.datetime), "HH:mm")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-5xl md:text-6xl">{featured.teamB.flag}</span>
                      <span className="text-white font-bold text-sm md:text-base">{featured.teamB.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* My League Strip */}
          {dashboard.myLeague && (
            <section>
              <Link href="/league">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform hover:bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#D97706]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] font-medium">Ma ligue · {dashboard.myLeague.name}</p>
                      <p className="font-bold text-[#1E293B]">
                        #{dashboard.myLeague.myRank}{" "}
                        <span className="text-[#64748B] text-sm font-normal">sur {dashboard.myLeague.memberCount}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{dashboard.myLeague.myPoints}</p>
                      <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">pts</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Highlights — desktop: shown inside left col below league */}
          <div className="hidden md:block">
            <HighlightsReel />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Highlights — mobile: shown in right col position (single col) */}
          <div className="md:hidden">
            <HighlightsReel />
          </div>

          {/* Today's Matches */}
          {dashboard?.todayMatches?.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Matchs du jour
                </h2>
                <Link href="/predictions" className="text-xs text-primary font-semibold">
                  Prédire →
                </Link>
              </div>
              <div className="space-y-3">
                {dashboard.todayMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
