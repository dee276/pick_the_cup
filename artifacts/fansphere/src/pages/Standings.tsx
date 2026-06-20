import { useState } from "react";
import { useGetStandings, getGetStandingsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const GROUPS = ["A", "B", "C", "D", "E", "F"];

const statusConfig = {
  qualified: { label: "QUA", bg: "bg-[#F0FDF4]", text: "text-[#15803D]", dot: "bg-[#15803D]" },
  danger: { label: "DAN", bg: "bg-[#FFF7ED]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
  eliminated: { label: "ELI", bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  pending: { label: "", bg: "", text: "text-[#64748B]", dot: "bg-[#CBD5E1]" },
};

export default function Standings() {
  const [activeGroup, setActiveGroup] = useState("F");

  const { data: standings, isLoading } = useGetStandings(
    { group: activeGroup },
    { query: { enabled: true, queryKey: getGetStandingsQueryKey({ group: activeGroup }) } }
  );

  const groupData = standings?.find((g) => g.group === activeGroup);

  return (
    <div className="flex flex-col min-h-full bg-slate-50" data-testid="standings-page">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-0 border-b border-[#E2E8F0]">
        <h1 className="text-xl font-bold text-[#1E293B] mb-4">Classements</h1>
        {/* Group tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              data-testid={`tab-group-${g}`}
              className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                activeGroup === g
                  ? "text-primary border-primary bg-[#EFF6FF]"
                  : "text-[#64748B] border-transparent hover:text-[#1E293B]"
              }`}
            >
              Groupe {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !groupData ? (
          <div className="text-center text-[#64748B] py-10">Aucune donnée disponible</div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <span className="text-xs font-bold text-[#64748B]">Équipe</span>
                <span className="text-xs font-bold text-[#64748B] w-8 text-center">J</span>
                <span className="text-xs font-bold text-[#64748B] w-8 text-center">Pts</span>
                <span className="text-xs font-bold text-[#64748B] w-8 text-center">DB</span>
                <span className="text-xs font-bold text-[#64748B] w-12 text-center">Statut</span>
              </div>

              {groupData.teams.map((team, i) => {
                const cfg = statusConfig[team.status as keyof typeof statusConfig] ?? statusConfig.pending;
                return (
                  <div
                    key={team.team.id}
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center px-4 py-3 ${
                      i < groupData.teams.length - 1 ? "border-b border-[#F1F5F9]" : ""
                    }`}
                    data-testid={`standing-row-${team.team.id}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-medium text-[#94A3B8] w-3">{i + 1}</span>
                      <span className="text-xl">{team.team.flag}</span>
                      <span className="text-sm font-semibold text-[#1E293B]">{team.team.code}</span>
                    </div>
                    <span className="text-xs text-[#64748B] w-8 text-center">{team.played}</span>
                    <span className="text-sm font-bold text-[#1E293B] w-8 text-center">{team.points}</span>
                    <span className="text-xs text-[#64748B] w-8 text-center">
                      {team.goalDiff !== undefined ? (team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff) : "0"}
                    </span>
                    <div className="w-12 flex justify-center">
                      {cfg.label ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 flex-wrap">
              {Object.entries(statusConfig).filter(([k]) => k !== "pending").map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-[#64748B]">
                    {key === "qualified" ? "Qualifié" : key === "danger" ? "En danger" : "Éliminé"}
                  </span>
                </div>
              ))}
            </div>

            {/* Key scenario */}
            {groupData.keyScenario && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
                <p className="text-xs font-bold text-primary mb-1">Scénario clé</p>
                <p className="text-xs text-[#1E293B] leading-relaxed">{groupData.keyScenario}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
