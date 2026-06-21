import { useUser, useClerk, Show } from "@clerk/react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Bell, Globe, Moon, ChevronRight, LogOut, LogIn } from "lucide-react";
import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function SignedInProfile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() },
  });

  const displayName = user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || "Fan";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarUrl = user?.imageUrl;

  const settingsItems = [
    { icon: Bell, label: "Notifications push", value: "Activées" },
    { icon: Globe, label: "Langue", value: "Français" },
    { icon: Moon, label: "Mode sombre", value: "Auto" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50" data-testid="profile-page">
      <div className="bg-white px-4 pt-12 pb-5 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-[#1E293B]">Mon profil</h1>
          <button className="p-2 rounded-full hover:bg-[#F1F5F9] transition-colors">
            <Settings className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-[#E2E8F0]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-black">{initials}</span>
            </div>
          )}
          <div>
            <p className="text-base font-bold text-[#1E293B]">{displayName}</p>
            <p className="text-xs text-[#64748B]">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
            <p className="text-xs text-[#2563EB] font-semibold mt-0.5">✓ Compte vérifié</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : profile && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pts total", value: profile.totalPoints },
              { label: "Précision", value: `${profile.predictionAccuracy}%` },
              { label: "Prédictions", value: profile.predictionCount },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-3 text-center">
                <p className="text-xl font-black text-[#1E293B]">{stat.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Favorite teams */}
        {profile?.favoriteTeams && profile.favoriteTeams.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-bold text-[#1E293B] mb-3">Équipes favorites</h2>
            <div className="flex gap-2 flex-wrap">
              {profile.favoriteTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
                  <span className="text-base">{team.flag}</span>
                  <span className="text-xs font-semibold text-[#1E293B]">{team.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social logins */}
        {user?.externalAccounts && user.externalAccounts.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <h2 className="text-sm font-bold text-[#1E293B] mb-3">Connexions sociales</h2>
            <div className="flex flex-col gap-2">
              {user.externalAccounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3 px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-lg">
                    {account.provider === "google" ? "🇬" : account.provider === "github" ? "🐙" : account.provider === "apple" ? "🍎" : "🔗"}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#1E293B] capitalize">{account.provider}</p>
                    <p className="text-xs text-[#64748B]">{account.emailAddress || account.username}</p>
                  </div>
                  <span className="ml-auto text-xs text-green-600 font-medium">✓ Lié</span>
                </div>
              ))}
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
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F8FAFC] transition-colors text-left ${i < settingsItems.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
              >
                <Icon className="w-4 h-4 text-[#64748B]" />
                <span className="flex-1 text-sm text-[#1E293B]">{item.label}</span>
                {item.value && <span className="text-sm text-[#64748B]">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: `${basePath}/` })}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-xl border border-[#E2E8F0] hover:bg-red-50 hover:border-red-200 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500 font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}

function SignedOutProfile() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 pb-5 border-b border-[#E2E8F0]">
        <h1 className="text-xl font-bold text-[#1E293B]">Mon profil</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="w-20 h-20 rounded-full bg-[#F1F5F9] flex items-center justify-center">
          <span className="text-4xl">⚽</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#1E293B] mb-1">Rejoignez PickTheCup</h2>
          <p className="text-sm text-[#64748B]">Créez votre compte pour sauvegarder vos pronostics, rejoindre des ligues privées et recevoir des alertes en direct.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setLocation("/sign-up")}
            className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Créer un compte
          </button>
          <button
            onClick={() => setLocation("/sign-in")}
            className="w-full py-3 bg-white text-[#1E293B] rounded-xl font-semibold border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </button>
        </div>
        <p className="text-xs text-[#94A3B8] text-center">
          Connexion via Google, GitHub, Apple et plus encore
        </p>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <>
      <Show when="signed-in">
        <SignedInProfile />
      </Show>
      <Show when="signed-out">
        <SignedOutProfile />
      </Show>
    </>
  );
}
