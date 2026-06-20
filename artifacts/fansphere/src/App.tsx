import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
