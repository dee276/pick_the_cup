import { Router } from "express";
import { getAuth } from "@clerk/express";
import { fetchLiveAndTodayMatches } from "../services/sportsdb";

const router = Router();

interface Client {
  userId: string | null;
  res: any;
}

const clients: Set<Client> = new Set();
let lastScores: Record<string, string> = {};
let pollingInterval: ReturnType<typeof setInterval> | null = null;

function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.res.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

function startPolling() {
  if (pollingInterval) return;
  pollingInterval = setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const matches = await fetchLiveAndTodayMatches();
      for (const match of matches) {
        const key = match.id;
        const score = `${match.homeScore}-${match.awayScore}-${match.status}`;
        const prev = lastScores[key];
        if (prev && prev !== score) {
          const [prevHome, prevAway] = prev.split("-");
          const [curHome, curAway] = score.split("-");
          if (curHome !== prevHome || curAway !== prevAway) {
            broadcast("goal", {
              matchId: match.id,
              home: match.homeTeam,
              away: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              minute: new Date().toISOString(),
            });
          }
          if (match.status === "live" && !prev.endsWith("-live")) {
            broadcast("match_started", {
              matchId: match.id,
              home: match.homeTeam,
              away: match.awayTeam,
              venue: match.venue,
            });
          }
          if ((match.status === "finished" || match.status === "ft") && !prev.endsWith("-finished") && !prev.endsWith("-ft")) {
            broadcast("match_ended", {
              matchId: match.id,
              home: match.homeTeam,
              away: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
            });
          }
        }
        lastScores[key] = score;
      }
    } catch {
      // silent - keep polling
    }
  }, 30_000);
}

router.get("/events/stream", (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId ?? null;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const client: Client = { userId, res };
  clients.add(client);
  startPolling();

  res.write(`event: connected\ndata: ${JSON.stringify({ userId, time: new Date().toISOString() })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(client);
  });
});

export default router;
