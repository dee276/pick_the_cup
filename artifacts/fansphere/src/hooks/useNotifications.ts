import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type NotificationEvent = {
  type: "goal" | "match_started" | "match_ended";
  data: Record<string, unknown>;
};

export function useNotifications(enabled = true) {
  const { toast } = useToast();
  const esRef = useRef<EventSource | null>(null);

  const handleGoal = useCallback((data: Record<string, unknown>) => {
    toast({
      title: `⚽ But ! ${data.home} ${data.homeScore} - ${data.awayScore} ${data.away}`,
      description: "Cliquez pour voir le match en direct",
      duration: 6000,
    });
  }, [toast]);

  const handleMatchStarted = useCallback((data: Record<string, unknown>) => {
    toast({
      title: `🏟️ Match débuté : ${data.home} vs ${data.away}`,
      description: data.venue as string ?? "",
      duration: 5000,
    });
  }, [toast]);

  const handleMatchEnded = useCallback((data: Record<string, unknown>) => {
    toast({
      title: `🏁 Fin du match : ${data.home} ${data.homeScore} - ${data.awayScore} ${data.away}`,
      duration: 5000,
    });
  }, [toast]);

  useEffect(() => {
    if (!enabled) return;

    const url = `${BASE}/api/events/stream`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener("goal", (e) => {
      try { handleGoal(JSON.parse(e.data)); } catch {}
    });
    es.addEventListener("match_started", (e) => {
      try { handleMatchStarted(JSON.parse(e.data)); } catch {}
    });
    es.addEventListener("match_ended", (e) => {
      try { handleMatchEnded(JSON.parse(e.data)); } catch {}
    });
    es.addEventListener("connected", () => {
      console.info("[SSE] Connected to live match stream");
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setTimeout(() => {}, 5000);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled, handleGoal, handleMatchStarted, handleMatchEnded]);
}
