/* A faithful recreation of scribe-menu — the daemon's settings + history panel
   (GJS + GTK4, design "4b"). Layout, palette and copy are ported from the real
   app in linux-transcription/menu (app.js + style.css); the same #0c0c0c/#ff4b4b
   palette the rest of this page already uses, so it renders as the actual thing.
   Static by design — a frozen frame of the live panel, not a second live meter. */

// A natural-looking 48-bar level meter, computed deterministically so the server
// and client render the same frame (no hydration mismatch, no Math.random).
const METER_BARS = Array.from({ length: 48 }, (_, i) => {
  const t = i / 47; // recent audio scrolls in from the right, so it reads louder
  const v =
    Math.abs(Math.sin(i * 0.7)) * 0.5 + Math.abs(Math.sin(i * 0.29 + 1)) * 0.42;
  return Math.min(1, 0.1 + v * (0.35 + 0.65 * t));
});

const FEED = [
  { ts: "09:14:03", text: "The uinput backend types below the compositor, so the layout has to match." },
  { ts: "09:14:27", text: "Check whether graphical-session.target is actually active on this box." },
  { ts: "09:15:11", text: "Dictating a commit message is the one place this pays for itself." },
];

const SESSIONS = [
  { when: "09:14", name: "blockers-on-the-auth-rewrite", snippet: "the uinput backend types below…", words: "47 w" },
  { when: "08:51", name: "morning-standup", snippet: "three things landed overnight…", words: "112 w" },
  { when: "08:32", name: "commit-message-draft", snippet: "fix the pre-roll gap on the first…", words: "29 w" },
];

function Caret() {
  return <span className="gui-caret">▾</span>;
}

export default function ScribeMenu() {
  return (
    <div className="gui" role="img" aria-label="The scribe-menu settings and history panel">
      <div className="gui-body">
        {/* ---- left: settings ---- */}
        <div className="gui-settings">
          <div className="gui-header">
            <div className="gui-host">
              <span className="gui-host-name">scribe</span>
              <span className="gui-dim3">@linux</span>
              <span className="gui-sep">·</span>
              <span className="gui-status-dot">●</span>
              <span>active</span>
              <span className="gui-sep">·</span>
              <span>pipewire</span>
            </div>
            <div className="gui-cfg-path">~/.config/scribe/config.ini</div>
          </div>

          <fieldset className="gui-field">
            <legend>hotkey</legend>
            <div className="gui-row">
              <span className="gui-chip">right ctrl</span>
              <span className="gui-grow" />
              <button type="button" className="gui-btn" tabIndex={-1}>
                [ set ]
              </button>
            </div>
          </fieldset>

          <fieldset className="gui-field">
            <legend>microphone</legend>
            <div className="gui-sel">
              <span>Scarlett Solo USB — analog stereo</span>
              <Caret />
            </div>
            <div className="gui-meter" aria-hidden="true">
              {METER_BARS.map((h, i) => (
                <span key={i} className="gui-bar" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </fieldset>

          <fieldset className="gui-field">
            <legend>model</legend>
            <div className="gui-sel">
              <span>gpt-4o-transcribe</span>
              <Caret />
            </div>
          </fieldset>

          <fieldset className="gui-field">
            <legend>api_key</legend>
            <div className="gui-row">
              <span className="gui-key">sk-••••••••••••••••••••••</span>
              <span className="gui-grow" />
              <span className="gui-link">[show]</span>
            </div>
          </fieldset>

          <fieldset className="gui-field">
            <legend>kb_layout</legend>
            <div className="gui-sel">
              <span>us — qwerty</span>
              <Caret />
            </div>
          </fieldset>
        </div>

        {/* ---- right: history ---- */}
        <div className="gui-history">
          <div className="gui-row">
            <span className="gui-h-title">transcriptions/</span>
            <span className="gui-h-grep">grep ▏</span>
            <span className="gui-grow" />
            <span className="gui-count">12 files</span>
          </div>
          <div className="gui-rule" />

          <div className="gui-feed">
            <div className="gui-feed-cmd">$ tail -f session.log</div>
            {FEED.map((row, i) => (
              <div className="gui-feed-row" key={i}>
                <span className="gui-ts">{row.ts}</span>
                <span className="gui-text">{row.text}</span>
              </div>
            ))}
            <span className="gui-cursor">█</span>
          </div>

          <div className="gui-grow" />

          <div className="gui-divider">──────── recent sessions ────────</div>
          <div className="gui-sessions">
            {SESSIONS.map((s, i) => (
              <div className={`gui-sess-row${i === 0 ? " selected" : ""}`} key={i}>
                <span className="gui-sess-time">{s.when}</span>
                <span className="gui-sess-name">
                  {s.name} <span className="gui-sess-snip">{s.snippet}</span>
                </span>
                <span className="gui-sess-words">{s.words}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- footer ---- */}
      <div className="gui-footer">
        <span className="gui-fk"><b>⏎</b> open</span>
        <span className="gui-fk"><b>/</b> search</span>
        <span className="gui-fk"><b>^E</b> export</span>
        <span className="gui-grow" />
        <span className="gui-fk"><b>^X</b> close</span>
      </div>
    </div>
  );
}
