import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { designTokens } from "@wiener-nebel/ui-tokens";

type MatchStage = "lobby" | "planning" | "resolving" | "meeting" | "finished";
type TicketType = "walk" | "subway" | "tram" | "bus" | "black";

interface PublicPlayerView {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  eliminated: boolean;
  isHost: boolean;
}

interface PublicLogEntry {
  round: number;
  message: string;
}

interface PublicMatchView {
  id: string;
  joinCode: string;
  mapId: string;
  stage: MatchStage;
  round: number;
  maxRounds: number;
  revealMrXPosition: boolean;
  players: PublicPlayerView[];
  publicLog: PublicLogEntry[];
}

interface PlayerPrivateView {
  id: string;
  role: "mr_x" | "investigator";
  nodeId: string;
  tickets: Record<TicketType, number>;
}

interface PlayerMatchView extends PublicMatchView {
  self: PlayerPrivateView;
}

interface SessionState {
  apiBaseUrl: string;
  playerId: string;
  playerName: string;
  matchId: string;
  joinCode: string;
}

interface CreateLobbyResponse {
  matchId: string;
  lobby: PublicMatchView;
}

interface JoinLobbyResponse {
  lobby: PublicMatchView;
}

interface PublicMatchResponse {
  match: PublicMatchView;
}

interface PlayerMatchResponse {
  match: PlayerMatchView;
}

interface ApiError {
  error: string;
}

const SESSION_STORAGE_KEY = "wiener-nebel-web-session";
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8787";

const shellStyle = {
  "--wn-color-bg": designTokens.colors.canvas,
  "--wn-color-surface": designTokens.colors.surface,
  "--wn-color-panel": designTokens.colors.panel,
  "--wn-color-accent": designTokens.colors.accent,
  "--wn-color-accent-soft": designTokens.colors.accentSoft,
  "--wn-color-text": designTokens.colors.text,
  "--wn-color-text-muted": designTokens.colors.textMuted,
  "--wn-shadow-panel": designTokens.shadows.panel
} as CSSProperties;

function createPlayerId(): string {
  return crypto.randomUUID();
}

function readStoredSession(): SessionState | null {
  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SessionState;
  } catch {
    return null;
  }
}

async function requestJson<TResponse extends object>(
  apiBaseUrl: string,
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = (await response.json()) as TResponse | ApiError;

  if (!response.ok) {
    throw new Error(
      "error" in payload ? payload.error : `HTTP ${response.status}`
    );
  }

  return payload as TResponse;
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [playerName, setPlayerName] = useState("Mat");
  const [joinPlayerName, setJoinPlayerName] = useState("Testspieler");
  const [joinMatchId, setJoinMatchId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [moveTarget, setMoveTarget] = useState("schwedenplatz");
  const [moveTicket, setMoveTicket] = useState<TicketType>("subway");
  const [meetingReason, setMeetingReason] = useState("Verdächtige Route");
  const [suspectPlayerId, setSuspectPlayerId] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [publicMatch, setPublicMatch] = useState<PublicMatchView | null>(null);
  const [playerMatch, setPlayerMatch] = useState<PlayerMatchView | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Lokalen Worker starten und dann Lobby erstellen oder beitreten."
  );
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      return;
    }

    setApiBaseUrl(storedSession.apiBaseUrl);
    setPlayerName(storedSession.playerName);
    setJoinPlayerName(storedSession.playerName);
    setJoinMatchId(storedSession.matchId);
    setJoinCode(storedSession.joinCode);
    setSession(storedSession);
  }, []);

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    void refreshState(session);

    const intervalId = window.setInterval(() => {
      void refreshState(session, false);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [session]);

  async function refreshState(
    currentSession = session,
    announce = true
  ): Promise<void> {
    if (!currentSession) {
      return;
    }

    try {
      const [publicPayload, playerPayload] = await Promise.all([
        requestJson<PublicMatchResponse>(
          currentSession.apiBaseUrl,
          `/matches/${currentSession.matchId}/state`
        ),
        requestJson<PlayerMatchResponse>(
          currentSession.apiBaseUrl,
          `/matches/${currentSession.matchId}/state?playerId=${encodeURIComponent(currentSession.playerId)}`
        )
      ]);

      setPublicMatch(publicPayload.match);
      setPlayerMatch(playerPayload.match);
      setJoinCode(publicPayload.match.joinCode);
      setSuspectPlayerId((currentValue) =>
        currentValue || publicPayload.match.players.find((player) => player.id !== currentSession.playerId)?.id || ""
      );

      if (announce) {
        setStatusMessage(
          `Match ${publicPayload.match.id} geladen. Status: ${publicPayload.match.stage}.`
        );
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Match-State konnte nicht geladen werden."
      );
    }
  }

  async function withBusyState(action: () => Promise<void>): Promise<void> {
    setIsBusy(true);

    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateLobby(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await withBusyState(async () => {
      const nextPlayerId = createPlayerId();
      const payload = await requestJson<CreateLobbyResponse>(apiBaseUrl, "/lobbies", {
        method: "POST",
        body: JSON.stringify({
          hostId: nextPlayerId,
          hostName: playerName,
          mapId: "vienna_core",
          minPlayers: 3,
          maxPlayers: 6,
          maxRounds: 20
        })
      });
      const nextSession: SessionState = {
        apiBaseUrl,
        playerId: nextPlayerId,
        playerName,
        matchId: payload.matchId,
        joinCode: payload.lobby.joinCode
      };

      setSession(nextSession);
      setJoinMatchId(payload.matchId);
      setJoinCode(payload.lobby.joinCode);
      setPublicMatch(payload.lobby);
      setStatusMessage(
        `Lobby erstellt. Match-ID: ${payload.matchId}, Join-Code: ${payload.lobby.joinCode}.`
      );

      await refreshState(nextSession, false);
    });
  }

  async function handleJoinLobby(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await withBusyState(async () => {
      const nextPlayerId = createPlayerId();
      const payload = await requestJson<JoinLobbyResponse>(apiBaseUrl, "/lobbies/join", {
        method: "POST",
        body: JSON.stringify({
          matchId: joinMatchId,
          joinCode,
          playerId: nextPlayerId,
          playerName: joinPlayerName
        })
      });
      const nextSession: SessionState = {
        apiBaseUrl,
        playerId: nextPlayerId,
        playerName: joinPlayerName,
        matchId: joinMatchId,
        joinCode: payload.lobby.joinCode
      };

      setSession(nextSession);
      setPublicMatch(payload.lobby);
      setStatusMessage(`Lobby beigetreten als ${joinPlayerName}.`);

      await refreshState(nextSession, false);
    });
  }

  async function handleStartMatch(): Promise<void> {
    if (!session) {
      return;
    }

    await withBusyState(async () => {
      const payload = await requestJson<PublicMatchResponse>(
        session.apiBaseUrl,
        `/matches/${session.matchId}/start`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId
          })
        }
      );

      setPublicMatch(payload.match);
      setStatusMessage("Match gestartet.");
      await refreshState(session, false);
    });
  }

  async function handleSubmitMove(): Promise<void> {
    if (!session || !playerMatch) {
      return;
    }

    await withBusyState(async () => {
      const payload = await requestJson<PlayerMatchResponse>(
        session.apiBaseUrl,
        `/matches/${session.matchId}/move`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId,
            move: {
              fromNodeId: playerMatch.self.nodeId,
              toNodeId: moveTarget,
              ticket: moveTicket
            }
          })
        }
      );

      setPlayerMatch(payload.match);
      setPublicMatch(payload.match);
      setStatusMessage(`Zug nach ${moveTarget} mit ${moveTicket} gespeichert.`);
    });
  }

  async function handleReady(): Promise<void> {
    if (!session) {
      return;
    }

    await withBusyState(async () => {
      const payload = await requestJson<PlayerMatchResponse>(
        session.apiBaseUrl,
        `/matches/${session.matchId}/ready`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId
          })
        }
      );

      setPlayerMatch(payload.match);
      setPublicMatch(payload.match);
      setStatusMessage("Spieler als bereit markiert.");
      await refreshState(session, false);
    });
  }

  async function handleMeeting(): Promise<void> {
    if (!session) {
      return;
    }

    await withBusyState(async () => {
      const payload = await requestJson<PublicMatchResponse>(
        session.apiBaseUrl,
        `/matches/${session.matchId}/meeting`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId,
            reason: meetingReason
          })
        }
      );

      setPublicMatch(payload.match);
      setStatusMessage("Meeting gestartet.");
      await refreshState(session, false);
    });
  }

  async function handleVote(): Promise<void> {
    if (!session) {
      return;
    }

    await withBusyState(async () => {
      const payload = await requestJson<PublicMatchResponse>(
        session.apiBaseUrl,
        `/matches/${session.matchId}/vote`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId,
            suspectPlayerId
          })
        }
      );

      setPublicMatch(payload.match);
      setStatusMessage("Stimme abgegeben.");
      await refreshState(session, false);
    });
  }

  function clearSession(): void {
    setSession(null);
    setPublicMatch(null);
    setPlayerMatch(null);
    setStatusMessage("Lokale Sitzung zurückgesetzt.");
  }

  return (
    <main className="app-shell" style={shellStyle}>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Browser-Testpfad</p>
          <h1>Wiener Nebel</h1>
          <p className="lead">
            Lokale Testoberfläche für Lobby, Join, Match-Start und die ersten
            Match-Aktionen gegen den Worker auf deinem Rechner.
          </p>
        </div>

        <div className="toolbar panel">
          <label className="field">
            <span>API-Basis</span>
            <input
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
              placeholder="http://127.0.0.1:8787"
            />
          </label>
          <button type="button" className="ghost-button" onClick={() => void refreshState()}>
            State laden
          </button>
          <button type="button" className="ghost-button" onClick={clearSession}>
            Sitzung löschen
          </button>
        </div>

        <div className="hero-grid hero-grid-wide">
          <section className="panel">
            <h2>Lobby erstellen</h2>
            <form className="stack" onSubmit={(event) => void handleCreateLobby(event)}>
              <label className="field">
                <span>Host-Name</span>
                <input
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <button type="submit" disabled={isBusy}>
                Lobby erstellen
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Lobby beitreten</h2>
            <form className="stack" onSubmit={(event) => void handleJoinLobby(event)}>
              <label className="field">
                <span>Match-ID</span>
                <input
                  value={joinMatchId}
                  onChange={(event) => setJoinMatchId(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Join-Code</span>
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  required
                />
              </label>
              <label className="field">
                <span>Spielername</span>
                <input
                  value={joinPlayerName}
                  onChange={(event) => setJoinPlayerName(event.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <button type="submit" disabled={isBusy}>
                Lobby beitreten
              </button>
            </form>
          </section>

          <section className="panel panel-status">
            <h2>Status</h2>
            <p>{statusMessage}</p>
            {session ? (
              <dl className="meta-grid">
                <div>
                  <dt>Match</dt>
                  <dd>{session.matchId}</dd>
                </div>
                <div>
                  <dt>Spieler</dt>
                  <dd>{session.playerName}</dd>
                </div>
                <div>
                  <dt>Join-Code</dt>
                  <dd>{session.joinCode}</dd>
                </div>
                <div>
                  <dt>Player-ID</dt>
                  <dd>{session.playerId}</dd>
                </div>
              </dl>
            ) : null}
          </section>
        </div>

        <div className="hero-grid hero-grid-wide">
          <section className="panel panel-span-2">
            <div className="panel-header">
              <h2>Öffentlicher Match-State</h2>
              {publicMatch ? (
                <button type="button" className="ghost-button" onClick={handleStartMatch}>
                  Match starten
                </button>
              ) : null}
            </div>
            {publicMatch ? (
              <>
                <dl className="meta-grid">
                  <div>
                    <dt>Stage</dt>
                    <dd>{publicMatch.stage}</dd>
                  </div>
                  <div>
                    <dt>Runde</dt>
                    <dd>
                      {publicMatch.round} / {publicMatch.maxRounds}
                    </dd>
                  </div>
                  <div>
                    <dt>Karte</dt>
                    <dd>{publicMatch.mapId}</dd>
                  </div>
                  <div>
                    <dt>Reveal</dt>
                    <dd>{publicMatch.revealMrXPosition ? "ja" : "nein"}</dd>
                  </div>
                </dl>

                <div className="players">
                  {publicMatch.players.map((player) => (
                    <article key={player.id} className="player-card">
                      <h3>{player.name}</h3>
                      <p>{player.isHost ? "Host" : "Spieler"}</p>
                      <p>Ready: {player.ready ? "ja" : "nein"}</p>
                      <p>Online: {player.connected ? "ja" : "nein"}</p>
                      <p>Eliminiert: {player.eliminated ? "ja" : "nein"}</p>
                    </article>
                  ))}
                </div>

                <div className="log-list">
                  {publicMatch.publicLog.map((entry, index) => (
                    <div key={`${entry.round}-${index}`} className="log-entry">
                      <strong>Runde {entry.round}</strong>
                      <span>{entry.message}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Noch kein Match geladen.</p>
            )}
          </section>

          <section className="panel">
            <h2>Spieleraktionen</h2>
            {playerMatch ? (
              <div className="stack">
                <dl className="meta-grid">
                  <div>
                    <dt>Rolle</dt>
                    <dd>{playerMatch.self.role}</dd>
                  </div>
                  <div>
                    <dt>Position</dt>
                    <dd>{playerMatch.self.nodeId}</dd>
                  </div>
                </dl>

                <label className="field">
                  <span>Zielknoten</span>
                  <input
                    value={moveTarget}
                    onChange={(event) => setMoveTarget(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Ticket</span>
                  <select
                    value={moveTicket}
                    onChange={(event) => setMoveTicket(event.target.value as TicketType)}
                  >
                    <option value="walk">walk</option>
                    <option value="subway">subway</option>
                    <option value="tram">tram</option>
                    <option value="bus">bus</option>
                    <option value="black">black</option>
                  </select>
                </label>

                <div className="button-row">
                  <button type="button" onClick={handleSubmitMove} disabled={isBusy}>
                    Zug speichern
                  </button>
                  <button type="button" onClick={handleReady} disabled={isBusy}>
                    Ready
                  </button>
                </div>

                <label className="field">
                  <span>Meeting-Grund</span>
                  <input
                    value={meetingReason}
                    onChange={(event) => setMeetingReason(event.target.value)}
                  />
                </label>
                <button type="button" onClick={handleMeeting} disabled={isBusy}>
                  Meeting starten
                </button>

                <label className="field">
                  <span>Verdächtiger Spieler</span>
                  <select
                    value={suspectPlayerId}
                    onChange={(event) => setSuspectPlayerId(event.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    {publicMatch?.players
                      .filter((player) => player.id !== session?.playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleVote}
                  disabled={isBusy || !suspectPlayerId}
                >
                  Stimme abgeben
                </button>

                <div className="ticket-grid">
                  {Object.entries(playerMatch.self.tickets).map(([ticket, count]) => (
                    <div key={ticket} className="ticket-chip">
                      <span>{ticket}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>Spielersicht erscheint nach Erstellen oder Beitreten einer Lobby.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
