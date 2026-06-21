import { useGetMatch, getGetMatchQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function MatchCenter() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const { data, isLoading } = useGetMatch(id, {
    query: { enabled: !!id, queryKey: getGetMatchQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="bg-primary p-6 pt-12 space-y-4">
          <Skeleton className="h-6 w-32 bg-white/20" />
          <Skeleton className="h-16 w-full bg-white/20" />
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { match, events, stats, userPrediction } = data;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const eventTypeLabel: Record<string, string> = {
    goal: "But",
    yellow_card: "Carton jaune",
    red_card: "Carton rouge",
    substitution: "Remplacement",
  };

  const eventTypeIcon: Record<string, string> = {
    goal: "⚽",
    yellow_card: "🟡",
    red_card: "🔴",
    substitution: "🔄",
  };

  return (
    <div className="flex flex-col min-h-full md:min-h-0" data-testid="match-center">
      {/* ── Match header banner ── */}
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white px-4 pt-10 pb-8 md:rounded-2xl md:mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <span className="font-medium text-white/80">Match Center</span>
          {isLive && (
            <Badge className="ml-auto bg-red-500 text-white border-0 animate-pulse px-2 py-0.5 text-xs font-bold">
              EN DIRECT
            </Badge>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2 flex-1" data-testid="team-a-info">
            <span className="text-5xl md:text-7xl">{match.teamA.flag}</span>
            <span className="font-bold text-base md:text-lg">{match.teamA.code}</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            {isLive || isFinished ? (
              <span className="text-5xl md:text-6xl font-black tracking-tight" data-testid="score-display">
                {match.scoreA} – {match.scoreB}
              </span>
            ) : (
              <span className="text-2xl font-semibold text-white/60">
                {format(new Date(match.datetime), "HH:mm")}
              </span>
            )}
            {isLive && match.minute && (
              <span className="text-sm text-white/70">{match.minute}'</span>
            )}
            <span className="text-xs text-white/60 mt-1 text-center">{match.group} · {match.stadium}</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1" data-testid="team-b-info">
            <span className="text-5xl md:text-7xl">{match.teamB.flag}</span>
            <span className="font-bold text-base md:text-lg">{match.teamB.code}</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-4 md:p-0 bg-slate-50 md:bg-transparent">
        {/* User prediction callout */}
        {userPrediction && (
          <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 mb-5" data-testid="prediction-callout">
            <p className="text-xs font-semibold text-primary mb-1">Ma prédiction</p>
            <p className="text-sm text-[#1E293B] font-medium">
              {userPrediction.predictedScoreA} – {userPrediction.predictedScoreB}
              {userPrediction.pointsEarned !== null && userPrediction.pointsEarned !== undefined && (
                <span className="ml-2 text-[#15803D] font-bold">+{userPrediction.pointsEarned} pts</span>
              )}
            </p>
          </div>
        )}

        {/* ── Two columns on desktop ── */}
        <div className="md:grid md:grid-cols-2 md:gap-6 space-y-5 md:space-y-0">
          {/* Events */}
          {events.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-[#1E293B] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Événements
              </h3>
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < events.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
                    data-testid={`event-${event.id}`}
                  >
                    <span className="text-sm font-bold text-[#64748B] w-8">{event.minute}'</span>
                    <span className="text-base">{eventTypeIcon[event.type] ?? "•"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1E293B]">{event.player}</p>
                      <p className="text-xs text-[#64748B]">
                        {event.team} · {eventTypeLabel[event.type] ?? event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-[#1E293B] mb-3">Statistiques</h3>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-4">
                {stats.map((stat) => {
                  const total = parseFloat(stat.valueA) + parseFloat(stat.valueB) || 100;
                  const pctA = Math.round((parseFloat(stat.valueA) / total) * 100) || 50;
                  return (
                    <div key={stat.label} data-testid={`stat-${stat.label}`}>
                      <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1.5">
                        <span>{stat.valueA}</span>
                        <span className="text-[#64748B] font-medium">{stat.label}</span>
                        <span>{stat.valueB}</span>
                      </div>
                      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pctA}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
