import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return <div className="p-4 space-y-4">Loading dashboard...</div>;
  }

  if (!dashboard) return null;

  return (
    <div className="p-4 space-y-6">
      <header className="pt-2 pb-4">
        <h1 className="text-2xl font-bold text-foreground">FanSphere</h1>
        <p className="text-muted-foreground text-sm">Welcome back, get ready for matchday.</p>
      </header>

      {/* Featured Live Match */}
      {dashboard.featuredMatch && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Featured Match</h2>
            <Badge variant="destructive" className="animate-pulse bg-red-600">LIVE {dashboard.featuredMatch.minute}'</Badge>
          </div>
          <Link href={`/match/${dashboard.featuredMatch.id}`} className="block">
            <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground p-6 shadow-md border-0 active:scale-[0.98] transition-transform">
              <div className="text-center text-sm font-medium opacity-80 mb-4">{dashboard.featuredMatch.group}</div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">{dashboard.featuredMatch.teamA.flag}</span>
                  <span className="font-bold text-sm">{dashboard.featuredMatch.teamA.code}</span>
                </div>
                <div className="flex items-center justify-center bg-black/20 rounded-lg px-6 py-2">
                  <span className="text-3xl font-black">{dashboard.featuredMatch.scoreA} - {dashboard.featuredMatch.scoreB}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">{dashboard.featuredMatch.teamB.flag}</span>
                  <span className="font-bold text-sm">{dashboard.featuredMatch.teamB.code}</span>
                </div>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* My League Strip */}
      <section>
        <Link href="/league">
          <Card className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors border-border shadow-sm active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#D97706] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">My League Rank</p>
                <p className="font-bold text-foreground">#{dashboard.myLeague.myRank} <span className="text-muted-foreground text-sm font-normal">of {dashboard.myLeague.memberCount}</span></p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <div>
                <p className="text-xl font-bold text-primary">{dashboard.myLeague.myPoints}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">PTS</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Today's Matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Today's Matches
          </h2>
        </div>
        <div className="space-y-3">
          {dashboard.todayMatches.map(match => (
            <Link key={match.id} href={`/match/${match.id}`} className="block">
              <Card className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors active:scale-[0.98] shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-end gap-1 w-12">
                    <span className="font-bold">{match.teamA.code}</span>
                    <span className="font-bold">{match.teamB.code}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>{match.teamA.flag}</span>
                    <span>{match.teamB.flag}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {match.status === 'upcoming' ? (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">
                        {format(new Date(match.datetime), 'HH:mm')}
                      </Badge>
                    ) : (
                      <div className="flex flex-col gap-1 items-center font-bold text-lg">
                        <span>{match.scoreA}</span>
                        <span>{match.scoreB}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
