import type { CSSProperties } from "react";
import { designTokens } from "@wiener-nebel/ui-tokens";

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

export default function App() {
  return (
    <main className="app-shell" style={shellStyle}>
      <section className="hero">
        <p className="eyebrow">Web/PWA zuerst</p>
        <h1>Wiener Nebel</h1>
        <p className="lead">
          Eine leicht hostbare PWA für schnelle Match-Tests, Diskussionen am
          Tisch und denselben Spielkern wie der mobile Client.
        </p>
        <div className="hero-grid">
          <article className="panel">
            <h2>Spielkern</h2>
            <p>
              Autoritativer Match-State im Durable Object, saubere Projektionen
              für öffentliche und private Informationen.
            </p>
          </article>
          <article className="panel">
            <h2>Client-Strategie</h2>
            <p>
              Web/PWA für schnelle Tests und Expo für Mobile, beide auf
              denselben Contracts und Design-Tokens.
            </p>
          </article>
          <article className="panel">
            <h2>Hosting</h2>
            <p>
              Cloudflare Pages für die PWA, Workers und D1 für das Backend ohne
              eigene Server-Flotte.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
