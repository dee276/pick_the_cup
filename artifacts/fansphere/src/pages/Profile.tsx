import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Bell, Globe, Moon, ChevronRight } from "lucide-react";

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pt-12">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  const settingsItems = [
    { icon: Bell, label: "Notifications", value: "" },
    { icon: Globe, label: "Langue", value: "Français" },
    { icon: Moon, label: "Mode sombre", value: "Auto" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50" data-testid="profile-page">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-5 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-[#1E293B]">Mon profil</h1>
          <button className="p-2 rounded-full hover:bg-[#F1F5F9] transition-colors" data-testid="button-settings">
            <Settings className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0" data-testid="avatar">
            <span className="text-white text-xl font-black">{profile.initials}</span>
          </div>
          <div>
            <p className="text-base font-bold text-[#1E293B]" data-testid="text-name">{profile.name}</p>
            <p className="text-xs text-[#64748B]">Fan depuis {profile.fanSince} · {profile.location}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pts total", value: profile.totalPoints },
            { label: "Précision", value: `${profile.predictionAccuracy}%` },
            { label: "Prédictions", value: profile.predictionCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#E2E8F0] p-3 text-center"
              data-testid={`profile-stat-${stat.label}`}
            >
              <p className="text-xl font-black text-[#1E293B]">{stat.value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Favorite teams */}
        {profile.favoriteTeams && profile.favoriteTeams.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-bold text-[#1E293B] mb-3">Équipes favorites</h2>
            <div className="flex gap-2 flex-wrap">
              {profile.favoriteTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full"
                  data-testid={`team-chip-${team.id}`}
                >
                  <span className="text-base">{team.flag}</span>
                  <span className="text-xs font-semibold text-[#1E293B]">{team.code}</span>
                </div>
              ))}
              <button className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-[#CBD5E1] rounded-full hover:bg-[#F8FAFC] transition-colors" data-testid="button-add-team">
                <span className="text-xs text-[#64748B]">+ Ajouter</span>
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9]">
            <h2 className="text-sm font-bold text-[#1E293B]">Paramètres</h2>
          </div>
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F8FAFC] transition-colors text-left ${
                  i < settingsItems.length - 1 ? "border-b border-[#F1F5F9]" : ""
                }`}
                data-testid={`settings-${item.label}`}
              >
                <Icon className="w-4 h-4 text-[#64748B]" />
                <span className="flex-1 text-sm text-[#1E293B]">{item.label}</span>
                {item.value && <span className="text-sm text-[#64748B]">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
