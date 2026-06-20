import { useGetLeagues, getGetLeaguesQueryKey, useGetLeague, getGetLeagueQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Copy, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";

export default function League() {
  const [copied, setCopied] = useState(false);

  const { data: leagues, isLoading: loadingLeagues } = useGetLeagues({
    query: { queryKey: getGetLeaguesQueryKey() },
  });

  const leagueId = leagues?.[0]?.id ?? 0;

  const { data: league, isLoading: loadingLeague } = useGetLeague(leagueId, {
    query: { enabled: !!leagueId, queryKey: getGetLeagueQueryKey(leagueId) },
  });

  const handleCopy = () => {
    if (league?.inviteCode) {
      navigator.clipboard.writeText(league.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingLeagues || loadingLeague) {
    return (
      <div className="p-4 space-y-4 pt-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20 px-6 text-center">
        <Trophy className="w-12 h-12 text-[#CBD5E1] mb-4" />
        <p className="text-[#64748B] text-sm">Aucune ligue privée</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50" data-testid="league-page">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-[#1E293B]">{league.name}</h1>
          {league.emoji && <span className="text-xl">{league.emoji}</span>}
        </div>
        <p className="text-xs text-[#64748B]">{league.memberCount} membres</p>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* My stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rang", value: `#${league.myRank}` },
            { label: "Points", value: league.myPoints },
            { label: "Membres", value: league.memberCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#E2E8F0] p-3 text-center"
              data-testid={`stat-${stat.label}`}
            >
              <p className="text-xl font-black text-[#1E293B]">{stat.value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-sm font-bold text-[#1E293B] mb-3">Classement</h2>
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {league.members.map((member, i) => {
              const isMe = member.isCurrentUser;
              return (
                <div
                  key={member.rank}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isMe ? "bg-[#F0FDF4]" : ""
                  } ${i < league.members.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
                  data-testid={`member-row-${member.rank}`}
                >
                  <span className="text-sm font-bold text-[#64748B] w-5">{member.rank}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isMe ? "bg-primary text-white" : "bg-[#F1F5F9] text-[#475569]"
                  }`}>
                    {member.initials}
                  </div>
                  <span className={`flex-1 text-sm font-semibold ${isMe ? "text-[#15803D]" : "text-[#1E293B]"}`}>
                    {isMe ? "Toi" : member.name}
                  </span>
                  <span className="text-sm font-bold text-[#1E293B]">{member.points}</span>
                  <div className="w-5 flex justify-center">
                    {member.change > 0 ? (
                      <ChevronUp className="w-4 h-4 text-[#15803D]" />
                    ) : member.change < 0 ? (
                      <ChevronDown className="w-4 h-4 text-[#DC2626]" />
                    ) : (
                      <Minus className="w-3 h-3 text-[#CBD5E1]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        {league.badges && league.badges.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1E293B] mb-3">Récompenses</h2>
            <div className="flex gap-2 flex-wrap">
              {league.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 bg-[#FFF7ED] border border-[#FDE68A] text-[#D97706] text-xs font-semibold rounded-full"
                  data-testid={`badge-${badge}`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Invite code */}
        <div>
          <button
            onClick={handleCopy}
            data-testid="button-copy-code"
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Code d'invitation</span>
              <span className="text-sm font-bold text-[#1E293B] font-mono">{league.inviteCode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Copy className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{copied ? "Copié!" : "Copier"}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
