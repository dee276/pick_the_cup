import { useState } from "react";
import {
  useGetPredictions,
  useGetMatches,
  useCreatePrediction,
  getGetPredictionsQueryKey,
  getGetMatchesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Clock, XCircle, Minus } from "lucide-react";

type TabType = "predict" | "history" | "results";

const statusConfig = {
  correct: { icon: CheckCircle, color: "text-[#15803D]", bg: "bg-[#F0FDF4]", label: "+15 pts" },
  partial: { icon: CheckCircle, color: "text-[#D97706]", bg: "bg-[#FFF7ED]", label: "+5 pts" },
  wrong: { icon: XCircle, color: "text-[#DC2626]", bg: "bg-[#FEF2F2]", label: "0 pts" },
  pending: { icon: Clock, color: "text-[#64748B]", bg: "bg-[#F8FAFC]", label: "En attente" },
};

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#1E293B] font-bold text-lg flex items-center justify-center hover:bg-[#E2E8F0] transition-colors active:scale-95"
        data-testid="button-decrement"
      >
        −
      </button>
      <span className="text-2xl font-black text-[#1E293B] w-8 text-center" data-testid="score-value">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95"
        data-testid="button-increment"
      >
        +
      </button>
    </div>
  );
}

export default function Predictions() {
  const [activeTab, setActiveTab] = useState<TabType>("predict");
  const [scores, setScores] = useState<Record<number, { a: number; b: number }>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: matches, isLoading: loadingMatches } = useGetMatches(
    { status: "upcoming" },
    { query: { queryKey: getGetMatchesQueryKey({ status: "upcoming" }) } }
  );

  const { data: predictions, isLoading: loadingPredictions } = useGetPredictions({
    query: { queryKey: getGetPredictionsQueryKey() },
  });

  const createPrediction = useCreatePrediction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPredictionsQueryKey() });
      },
    },
  });

const upcomingMatches = Array.isArray(matches) ? matches.filter((m) => m.status === "upcoming") : [];
const predictionHistory = Array.isArray(predictions) ? predictions : [];
const results = predictionHistory.filter((p) => p.status !== "pending");

  const getScore = (matchId: number, team: "a" | "b") => scores[matchId]?.[team] ?? 0;

  const handleSubmit = async (matchId: number) => {
    setSubmitting(matchId);
    createPrediction.mutate(
      {
        data: {
          matchId,
          predictedScoreA: getScore(matchId, "a"),
          predictedScoreB: getScore(matchId, "b"),
        },
      },
      { onSettled: () => setSubmitting(null) }
    );
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "predict", label: "À prédire" },
    { id: "history", label: "Historique" },
    { id: "results", label: "Résultats" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50 md:bg-transparent" data-testid="predictions-page">

      {/* ── Mobile header ── */}
      <div className="md:hidden bg-white px-4 pt-12 pb-0 border-b border-[#E2E8F0]">
        <h1 className="text-xl font-bold text-[#1E293B] mb-4">Prédictions</h1>
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id ? "text-primary border-primary" : "text-[#64748B] border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#1E293B]">Prédictions</h1>
        <div className="flex gap-1 bg-[#F1F5F9] rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#1E293B] shadow-sm"
                  : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-4 md:p-0 space-y-3">
        {/* PREDICT TAB */}
        {activeTab === "predict" && (
          <>
            {loadingMatches ? (
              <div className="md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
              </div>
            ) : upcomingMatches.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-sm">
                Aucun match à prédire pour l'instant
              </div>
            ) : (
              <div className="md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-4"
                    data-testid={`predict-card-${match.id}`}
                  >
                    <div className="text-xs text-[#64748B] mb-3">
                      {match.teamA.name} vs {match.teamB.name} ·{" "}
                      {format(new Date(match.datetime), "HH:mm", { locale: fr })} · Groupe {match.group}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-3xl">{match.teamA.flag}</span>
                        <span className="text-sm font-bold text-[#1E293B]">{match.teamA.code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ScoreInput
                          value={getScore(match.id, "a")}
                          onChange={(v) =>
                            setScores((s) => ({ ...s, [match.id]: { a: v, b: getScore(match.id, "b") } }))
                          }
                        />
                        <Minus className="w-4 h-4 text-[#CBD5E1]" />
                        <ScoreInput
                          value={getScore(match.id, "b")}
                          onChange={(v) =>
                            setScores((s) => ({ ...s, [match.id]: { a: getScore(match.id, "a"), b: v } }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-bold text-[#1E293B]">{match.teamB.code}</span>
                        <span className="text-3xl">{match.teamB.flag}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubmit(match.id)}
                      disabled={submitting === match.id}
                      data-testid={`button-confirm-${match.id}`}
                      className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-[0.99]"
                    >
                      {submitting === match.id ? "Confirmation..." : "Confirmer ma prédiction"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <>
            {loadingPredictions ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : predictionHistory.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-sm">Aucune prédiction enregistrée</div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {predictionHistory.map((pred, i) => {
                  const cfg = statusConfig[pred.status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={pred.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < predictionHistory.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
                      data-testid={`history-row-${pred.id}`}
                    >
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-base">{pred.teamA.flag}</span>
                        <span className="text-xs font-bold text-[#1E293B]">{pred.teamA.code}</span>
                        <span className="text-xs text-[#64748B] mx-1">{pred.predictedScoreA}–{pred.predictedScoreB}</span>
                        <span className="text-xs font-bold text-[#1E293B]">{pred.teamB.code}</span>
                        <span className="text-base">{pred.teamB.flag}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${cfg.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-sm">Aucun résultat disponible</div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {results.map((pred, i) => {
                  const cfg = statusConfig[pred.status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={pred.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < results.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
                      data-testid={`result-row-${pred.id}`}
                    >
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-base">{pred.teamA.flag}</span>
                        <span className="text-xs font-bold text-[#1E293B]">{pred.teamA.code}</span>
                        <span className="text-xs text-[#64748B] mx-1">{pred.predictedScoreA}–{pred.predictedScoreB}</span>
                        <span className="text-xs font-bold text-[#1E293B]">{pred.teamB.code}</span>
                        <span className="text-base">{pred.teamB.flag}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${cfg.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
