import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/MobileLayout";
import Dashboard from "@/pages/Dashboard";
import MatchCenter from "@/pages/MatchCenter";
import Standings from "@/pages/Standings";
import Predictions from "@/pages/Predictions";
import League from "@/pages/League";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { useNotifications } from "@/hooks/useNotifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk" as const,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  variables: {
    colorPrimary: "#2563EB",
    colorForeground: "#1E293B",
    colorMutedForeground: "#64748B",
    colorDanger: "#EF4444",
    colorBackground: "#FFFFFF",
    colorInput: "#F8FAFC",
    colorInputForeground: "#1E293B",
    colorNeutral: "#E2E8F0",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#1E293B] font-bold",
    headerSubtitle: "text-[#64748B]",
    socialButtonsBlockButtonText: "text-[#1E293B] font-medium",
    formFieldLabel: "text-[#1E293B] font-medium",
    footerActionLink: "text-[#2563EB] font-semibold",
    footerActionText: "text-[#64748B]",
    dividerText: "text-[#64748B]",
    identityPreviewEditButton: "text-[#2563EB]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#1E293B]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-12 w-12",
    socialButtonsBlockButton: "border border-[#E2E8F0] hover:bg-[#F8FAFC]",
    formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold",
    formFieldInput: "bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B]",
    footerAction: "bg-[#F8FAFC]",
    dividerLine: "bg-[#E2E8F0]",
    alert: "bg-red-50 border border-red-200",
    otpCodeFieldInput: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppWithNotifications({ children }: { children: React.ReactNode }) {
  useNotifications(true);
  return <>{children}</>;
}

function Router() {
  return (
    <AppWithNotifications>
      <MobileLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/match/:id" component={MatchCenter} />
          <Route path="/standings" component={Standings} />
          <Route path="/predictions" component={Predictions} />
          <Route path="/league" component={League} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </MobileLayout>
    </AppWithNotifications>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bienvenue sur FanSphere",
            subtitle: "Connectez-vous pour accéder à votre compte",
          },
        },
        signUp: {
          start: {
            title: "Rejoignez FanSphere",
            subtitle: "Suivez la Coupe du Monde 2026 comme un vrai fan",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={Router} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
