import { useState } from "react";
import { useUser } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const WC_TEAMS = [
  { name: "France", flag: "🇫🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Korea Republic", flag: "🇰🇷" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Austria", flag: "🇦🇹" },
];

const UNIQUE_TEAMS = WC_TEAMS.filter(
  (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i,
);

type Props = {
  onDone: () => void;
};

export function OnboardingModal({ onDone }: Props) {
  const { user } = useUser();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else if (next.size < 5) next.add(name);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const teams = Array.from(selected);
      await fetch(`${BASE}/api/preferences/favorite-teams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams }),
      });
      for (const team of teams) {
        await fetch(`${BASE}/api/interactions`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType: "team", entityId: team, action: "favorite" }),
        });
      }
    } catch {}
    onDone();
  }

  const firstName = user?.firstName || user?.username || "Fan";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xl font-black">
              🏆
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1E293B]">
                Bienvenue, {firstName} !
              </h2>
              <p className="text-xs text-[#64748B]">Personnalisez votre expérience</p>
            </div>
          </div>
          <p className="text-sm text-[#475569]">
            Choisissez jusqu'à <span className="font-bold text-[#2563EB]">5 équipes favorites</span> — PickTheCup adaptera votre dashboard et vos recommandations.
          </p>
        </div>

        {/* Team grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {UNIQUE_TEAMS.map((team) => {
              const active = selected.has(team.name);
              return (
                <button
                  key={team.name}
                  onClick={() => toggle(team.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    active
                      ? "border-[#2563EB] bg-blue-50 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span className="text-2xl">{team.flag}</span>
                  <span
                    className={`text-[10px] font-bold text-center leading-tight ${
                      active ? "text-[#2563EB]" : "text-[#475569]"
                    }`}
                  >
                    {team.name}
                  </span>
                  {active && (
                    <span className="w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[9px] font-black">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4 border-t border-[#F1F5F9] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>{selected.size} / 5 équipe{selected.size !== 1 ? "s" : ""} sélectionnée{selected.size !== 1 ? "s" : ""}</span>
            {selected.size > 0 && (
              <span className="flex gap-1">
                {Array.from(selected).map((n) => {
                  const t = UNIQUE_TEAMS.find((x) => x.name === n);
                  return <span key={n}>{t?.flag}</span>;
                })}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-[#2563EB] text-white rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : selected.size > 0 ? "Confirmer mes équipes →" : "Passer cette étape"}
          </button>
        </div>
      </div>
    </div>
  );
}
