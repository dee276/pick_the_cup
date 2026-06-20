import { useCallback } from "react";
import { useUser } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type TrackParams = {
  entityType: "match" | "team" | "highlight";
  entityId: string;
  action: "view" | "predict" | "watch_highlight" | "favorite";
  metadata?: Record<string, unknown>;
};

export function useTrackInteraction() {
  const { isSignedIn } = useUser();

  const track = useCallback(
    (params: TrackParams) => {
      if (!isSignedIn) return;
      fetch(`${BASE}/api/interactions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }).catch(() => {});
    },
    [isSignedIn],
  );

  return { track };
}
