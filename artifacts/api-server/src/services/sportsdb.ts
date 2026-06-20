const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const WC_LEAGUE_ID = "4429";

export interface SportsDBEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strGroup: string;
  dateEvent: string;
  strTimestamp: string;
  strVenue: string;
  strVideo: string;
  strThumb: string;
  strPoster: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
}

export interface SportsDBStanding {
  intRank: string;
  strTeam: string;
  idTeam: string;
  strBadge: string;
  strGroup: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strDescription: string;
}

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000;

async function cachedFetch<T>(url: string): Promise<T | null> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.ts < CACHE_TTL) return cached.data as T;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    if (text.startsWith("<")) return null;
    const data = JSON.parse(text) as T;
    cache.set(url, { data, ts: now });
    return data;
  } catch {
    return null;
  }
}

export async function getEventsByDay(date: string): Promise<SportsDBEvent[]> {
  const data = await cachedFetch<{ events: SportsDBEvent[] }>(
    `${SPORTSDB_BASE}/eventsday.php?d=${date}&s=Soccer`
  );
  return (data?.events ?? []).filter((e) => e.idLeague === WC_LEAGUE_ID || (e as any).strLeague === "FIFA World Cup");
}

export async function getEventDetail(id: string): Promise<SportsDBEvent | null> {
  const data = await cachedFetch<{ events: SportsDBEvent[] }>(
    `${SPORTSDB_BASE}/lookupevent.php?id=${id}`
  );
  return data?.events?.[0] ?? null;
}

export async function getStandings(): Promise<SportsDBStanding[]> {
  const data = await cachedFetch<{ table: SportsDBStanding[] }>(
    `${SPORTSDB_BASE}/lookuptable.php?l=${WC_LEAGUE_ID}&s=2026`
  );
  return data?.table ?? [];
}

export function statusToAppStatus(strStatus: string): string {
  if (strStatus === "NS") return "upcoming";
  if (strStatus === "FT" || strStatus === "AET" || strStatus === "PEN") return "finished";
  if (["1H", "2H", "HT", "ET", "PEN"].some((s) => strStatus.includes(s))) return "live";
  return "upcoming";
}

export function flagEmoji(teamName: string): string {
  const flags: Record<string, string> = {
    "Brazil": "🇧🇷", "Haiti": "🇭🇹", "Germany": "🇩🇪", "Ivory Coast": "🇨🇮",
    "Ecuador": "🇪🇨", "Curaçao": "🇨🇼", "Tunisia": "🇹🇳", "Japan": "🇯🇵",
    "Belgium": "🇧🇪", "Iran": "🇮🇷", "New Zealand": "🇳🇿", "Egypt": "🇪🇬",
    "Argentina": "🇦🇷", "Austria": "🇦🇹", "Jordan": "🇯🇴", "Algeria": "🇩🇿",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "France": "🇫🇷", "Senegal": "🇸🇳",
    "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴", "Canada": "🇨🇦", "Qatar": "🇶🇦",
    "Mexico": "🇲🇽", "South Korea": "🇰🇷", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Morocco": "🇲🇦",
    "USA": "🇺🇸", "Australia": "🇦🇺", "Norway": "🇳🇴", "Ghana": "🇬🇭",
    "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
    "Netherlands": "🇳🇱", "Switzerland": "🇨🇭",
    "Portugal": "🇵🇹", "Poland": "🇵🇱", "Denmark": "🇩🇰",
    "United States": "🇺🇸", "Korea Republic": "🇰🇷",
  };
  return flags[teamName] ?? "🏳️";
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export interface SimpleMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  status: string;
  venue: string;
}

export async function fetchLiveAndTodayMatches(): Promise<SimpleMatch[]> {
  const today = new Date().toISOString().split("T")[0];
  const events = await getEventsByDay(today);
  return events.map((e) => ({
    id: e.idEvent,
    homeTeam: e.strHomeTeam,
    awayTeam: e.strAwayTeam,
    homeScore: e.intHomeScore,
    awayScore: e.intAwayScore,
    status: statusToAppStatus(e.strStatus),
    venue: e.strVenue,
  }));
}
