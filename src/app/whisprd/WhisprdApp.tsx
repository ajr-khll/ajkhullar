"use client";

import { useEffect, useRef, useState } from "react";
import DecryptedText from "@/components/reactbits/DecryptedText";
import FadeContent from "@/components/reactbits/FadeContent";
import { useReducedMotion } from "@/components/reactbits/useReducedMotion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const REPO = "https://github.com/ajr-khll/linux-transcription";

/* A copy-to-clipboard button matching the original .copy behaviour: the label
   flips to "copied" (or "ctrl+c" if the API is blocked) and reverts. */
function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState("copy");
  return (
    <button
      className="copy"
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(
          () => {
            setLabel("copied");
            setTimeout(() => setLabel("copy"), 1400);
          },
          () => {
            setLabel("ctrl+c");
            setTimeout(() => setLabel("copy"), 1400);
          }
        );
      }}
    >
      {label}
    </button>
  );
}

export default function WhisprdApp() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const meterRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const wfootRef = useRef<HTMLDivElement>(null);

  /* The interactive meter, ported from docs/index.html verbatim in behaviour.
     The one change: CSS variables now live on the .whisprd wrapper rather than
     :root, so colours are read from rootRef instead of documentElement. */
  useEffect(() => {
    const root = rootRef.current;
    const key = keyRef.current;
    const meter = meterRef.current;
    const stateEl = stateRef.current;
    const clockEl = clockRef.current;
    const out = outRef.current;
    const dot = dotRef.current;
    const wfoot = wfootRef.current;
    if (!root || !key || !meter || !stateEl || !clockEl || !out || !dot || !wfoot)
      return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const LINES = [
      "The uinput backend types below the compositor, so the layout has to match.",
      "Remember to check whether graphical-session.target is actually active on this box.",
      "Dictating a commit message is the one place this pays for itself immediately.",
      "Every utterance here is a paid API call, which is a strange thing to get used to.",
    ];
    let li = 0;

    /* ---- meter ---- */
    let W = 0,
      H = 0,
      dpr = 1;
    const ctx = meter.getContext("2d")!;
    const css = (n: string) =>
      getComputedStyle(root).getPropertyValue(n).trim();
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = meter!.clientWidth;
      H = 42;
      meter!.width = W * dpr;
      meter!.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    let level = 0,
      peak = 0,
      peakT = 0;
    function draw() {
      if (!W) size();
      const seg = 5,
        gap = 2,
        n = Math.floor((W + gap) / (seg + gap)),
        lit = Math.round(n * level);
      ctx.clearRect(0, 0, W, H);
      const bar = 26,
        top = 2;
      const lo = css("--rule-soft"),
        hi = css("--acc"),
        top20 = css("--acc-3");
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1 || 1),
          x = i * (seg + gap);
        ctx.fillStyle = i < lit ? (f > 0.88 ? top20 : hi) : lo;
        ctx.fillRect(x, top, seg, bar);
      }
      if (peak > 0.01) {
        const px = Math.min(n - 1, Math.round(n * peak)) * (seg + gap);
        ctx.fillStyle = css("--text-hi");
        ctx.fillRect(px, top, 2, bar);
      }
      ctx.fillStyle = css("--line-2");
      ctx.fillRect(0, top + bar + 3, W, 1);
      const fx = Math.round(W * 0.02);
      ctx.fillRect(fx, top + bar + 1, 1, 6);
      ctx.fillStyle = css("--dim-3");
      ctx.font = '9px "Plex Mono", monospace';
      ctx.fillText("2% floor", fx + 4, top + bar + 12);
      ctx.textAlign = "right";
      ctx.fillText("0 dBFS", W, top + bar + 12);
      ctx.textAlign = "left";
    }

    /* ---- state ---- */
    let held = false,
      t0 = 0,
      raf = 0,
      phase = 0,
      typing: ReturnType<typeof setInterval> | null = null;
    const setState = (txt: string, cls: string) => {
      stateEl!.textContent = txt;
      stateEl!.className = cls;
    };
    const clearTyping = () => {
      if (typing) {
        clearInterval(typing);
        typing = null;
      }
    };

    function loop() {
      const dt = (performance.now() - t0) / 1000;
      clockEl!.textContent = dt.toFixed(2);
      phase += 0.16;
      const syl =
        Math.abs(Math.sin(phase * 0.9)) * 0.55 +
        Math.abs(Math.sin(phase * 2.3)) * 0.3;
      const swell = Math.min(1, dt * 3);
      const target = Math.min(0.97, (0.28 + syl * 0.72) * swell);
      level += (target - level) * 0.35;
      if (level > peak) {
        peak = level;
        peakT = performance.now();
      } else if (performance.now() - peakT > 700) {
        peak = Math.max(0, peak - 0.012);
      }
      draw();
      if (held) raf = requestAnimationFrame(loop);
    }

    function press() {
      if (held) return;
      held = true;
      t0 = performance.now();
      phase = 0;
      peak = 0;
      clearTyping();
      key!.classList.add("down");
      dot!.classList.add("live");
      setState("capturing", "state-cap");
      wfoot!.textContent = "-- INSERT --";
      if (reduced) {
        level = 0.7;
        draw();
        clockEl!.textContent = "0.00";
      } else raf = requestAnimationFrame(loop);
    }

    function decay() {
      level *= 0.82;
      peak = Math.max(0, peak - 0.05);
      draw();
      if (level > 0.01) requestAnimationFrame(decay);
      else {
        level = 0;
        peak = 0;
        draw();
      }
    }

    function release() {
      if (!held) return;
      held = false;
      cancelAnimationFrame(raf);
      key!.classList.remove("down");
      dot!.classList.remove("live");
      const ms = performance.now() - t0;
      decay();

      if (ms < 100) {
        setState("discarded", "state-drop");
        clockEl!.textContent = (ms / 1000).toFixed(2);
        wfoot!.textContent =
          "stray tap · " + Math.round(ms) + " ms < 100 ms minimum";
        setTimeout(() => {
          if (!held) {
            setState("idle", "state-idle");
            wfoot!.textContent = "-- INSERT --";
          }
        }, 2200);
        return;
      }

      setState("POST → api.openai.com", "state-net");
      wfoot!.textContent = "uploading " + (ms / 1000).toFixed(2) + " s of 16 kHz mono";
      setTimeout(() => {
        if (held) return;
        setState("typing", "state-cap");
        wfoot!.textContent = "-- INSERT --";
        const text = LINES[li++ % LINES.length];
        let i = 0;
        let prev = out!.textContent || "";
        if (prev.length > 240) prev = "";
        const head = prev ? prev + " " : "";
        typing = setInterval(
          () => {
            i++;
            out!.textContent = head + text.slice(0, i);
            const caret = document.createElement("span");
            caret.className = "caret";
            out!.appendChild(caret);
            if (i >= text.length) {
              clearTyping();
              setState("idle", "state-idle");
            }
          },
          reduced ? 1 : 18
        );
      }, 620);
    }

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      try {
        key!.setPointerCapture(e.pointerId);
      } catch {}
      press();
    };
    const onKeyDownBtn = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        press();
      }
    };
    const onKeyUpBtn = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        release();
      }
    };
    const onWinKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ControlRight") {
        e.preventDefault();
        press();
      }
    };
    const onWinKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ControlRight") release();
    };
    const onBlur = () => {
      if (held) release();
    };
    const onResize = () => {
      size();
      draw();
    };

    key.addEventListener("pointerdown", onPointerDown);
    key.addEventListener("pointerup", release);
    key.addEventListener("pointercancel", release);
    key.addEventListener("keydown", onKeyDownBtn);
    key.addEventListener("keyup", onKeyUpBtn);
    window.addEventListener("keydown", onWinKeyDown);
    window.addEventListener("keyup", onWinKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);

    size();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      clearTyping();
      key.removeEventListener("pointerdown", onPointerDown);
      key.removeEventListener("pointerup", release);
      key.removeEventListener("pointercancel", release);
      key.removeEventListener("keydown", onKeyDownBtn);
      key.removeEventListener("keyup", onKeyUpBtn);
      window.removeEventListener("keydown", onWinKeyDown);
      window.removeEventListener("keyup", onWinKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="whisprd" ref={rootRef}>
     <TooltipProvider delayDuration={150}>
      <header className="top">
        <div className="wrap top-in">
          <span className="sdot" aria-hidden="true"></span>
          <span className="mark">whisprd</span>
          <span className="top-sep">·</span>
          <span className="top-meta">hold-to-talk dictation · wayland &amp; x11</span>
          <span className="top-sp"></span>
          <a className="top-link" href="#install">
            install
          </a>
          <a className="top-link" href={REPO}>
            github ↗
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <h1>
            Hold a key. Speak. The words land where you were{" "}
            <em>
              <DecryptedText
                text="already typing."
                animateOn={reduced ? "hover" : "view"}
                sequential
                speed={40}
                revealDirection="start"
                encryptedClassName="dt-enc"
              />
            </em>
          </h1>
          <p className="hero-sub">
            whisprd is a small daemon for Linux. Press and hold your hotkey,
            talk, let go — the transcript is typed into whatever window has
            focus. No window to switch to, nothing to paste.
          </p>
          <div className="cta">
            <a className="btn btn-fill" href={REPO}>
              View on GitHub
            </a>
            <a className="btn" href="#install">
              Install it
            </a>
          </div>

          <FadeContent className="demo panel" blur duration={820} threshold={0.15}>
            <div className="demo-l">
              <div>
                <div className="field">
                  <span className="legend">hotkey</span>
                  <button
                    className="key"
                    id="key"
                    ref={keyRef}
                    type="button"
                    aria-label="Hold to dictate"
                  >
                    HOLD &nbsp;·&nbsp; KEY_RIGHTCTRL
                  </button>
                </div>
                <p className="hint">
                  Hold the button, or the real <kbd>Right Ctrl</kbd> on your
                  keyboard. Let go to hear back. Tap it and release fast — under
                  100&nbsp;ms is thrown away as a stray tap, same as the daemon
                  does.
                </p>
              </div>
              <div className="field">
                <span className="legend">level</span>
                <canvas className="meter" ref={meterRef} aria-hidden="true"></canvas>
                <div className="readout">
                  <span ref={stateRef} className="state-idle">
                    idle
                  </span>
                  <span>
                    <b ref={clockRef}>0.00</b> s
                  </span>
                </div>
              </div>
            </div>
            <div className="demo-r">
              <div className="win">
                <div className="win-bar">
                  <span className="dot" ref={dotRef}></span>
                  <span>nvim &nbsp;~/notes/inbox.md</span>
                </div>
                <div className="win-body" ref={outRef}>
                  <span className="caret"></span>
                </div>
                <div className="win-foot" ref={wfootRef}>
                  -- INSERT --
                </div>
              </div>
              <div className="readout">
                <span className="rd-lab">backend</span>
                <span>
                  <b>wlr-vk</b> · zwp_virtual_keyboard_v1
                </span>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      <section className="sec">
        <div className="wrap sec-in">
          <div className="tag">
            the&nbsp;<b>signal path</b>
          </div>
          <div className="body-col">
            <h2>
              Four steps, and none of them is a window you have to look at.
            </h2>
            <p className="lede">
              The daemon holds no model and does no inference. It captures
              audio, posts it to OpenAI, and types back the answer. That is the
              whole program.
            </p>
            <div className="path">
              <div className="wstage">
                <div className="wstage-n">01</div>
                <div>
                  <h3>evdev watches one key</h3>
                  <p>
                    An epoll loop reads <code>/dev/input/event*</code>. The input
                    thread never blocks — it flips an atomic and goes straight
                    back to waiting, so release is instant however slow the
                    network is.
                  </p>
                </div>
              </div>
              <div className="wstage">
                <div className="wstage-n">02</div>
                <div>
                  <h3>Capture runs the whole time</h3>
                  <p>
                    The stream is open at 16 kHz mono S16 — exactly what Whisper
                    wants, so nothing is ever resampled. A 250 ms rolling
                    pre-roll is glued to the front of each utterance, which is
                    how the first consonant survives the gap between your finger
                    and the daemon noticing.
                  </p>
                </div>
              </div>
              <div className="wstage">
                <div className="wstage-n">03</div>
                <div>
                  <h3>One multipart POST</h3>
                  <p>
                    The audio becomes a WAV in memory and goes to{" "}
                    <code>/audio/transcriptions</code>. The queue is bounded and
                    drops the oldest, so a slow endpoint can stall a transcript
                    but never the microphone.
                  </p>
                </div>
              </div>
              <div className="wstage">
                <div className="wstage-n">04</div>
                <div>
                  <h3>Keystrokes, not a clipboard</h3>
                  <p>
                    Where the compositor allows it, whisprd types the text as
                    real key events. The virtual keyboard carries its own
                    keymap, so your layout does not matter and no modifier
                    bookkeeping is needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap sec-in">
          <div className="tag">
            read&nbsp;<b>this first</b>
          </div>
          <div className="body-col">
            <FadeContent className="warn" blur duration={700} threshold={0.2}>
              <h2>Everything you dictate is uploaded to OpenAI.</h2>
              <p>
                That is the design, not a footnote. whisprd is a thin client,
                not a local transcriber: you bring an API key and every utterance
                becomes a paid API call. Do not speak anything into it you would
                not paste into a web form.
              </p>
              <p>
                Pointing it at a local OpenAI-compatible server works — the
                request is identical either way — but that path is untested and
                unsupported.
              </p>
            </FadeContent>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap sec-in">
          <div className="tag">
            three&nbsp;<b>backends</b>
          </div>
          <div className="body-col">
            <h2>
              Typing into a Wayland window is three different problems, so there
              are three answers.
            </h2>
            <p className="lede">
              Auto-detection takes the first one that probes clean and prefers
              real typing. Override it with <code>backend =</code> in the config.
            </p>
            <div className="grid3">
              <div className="field cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="legend legend-tip">wlr-vk</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    zwlr_virtual_keyboard_manager_v1 · wlroots only
                  </TooltipContent>
                </Tooltip>
                <p className="cell-where">hyprland · sway · river</p>
                <p>
                  Uploads its own keymap where every character it needs sits
                  alone on its own key, so your active layout is irrelevant.
                </p>
                <div className="cost">
                  <b>cost:</b> the manager global exists only on wlroots
                </div>
              </div>
              <div className="field cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="legend legend-tip">uinput</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    /dev/uinput + libxkbcommon · types below the compositor
                  </TooltipContent>
                </Tooltip>
                <p className="cell-where">gnome · kde</p>
                <p>
                  Injects raw keycodes below the compositor, which then reads
                  them through your layout. libxkbcommon works out which keycode
                  and level makes each character, and the two cancel out.
                </p>
                <div className="cost">
                  <b>cost:</b> <code>layout</code> must match your active one
                </div>
              </div>
              <div className="field cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="legend legend-tip">clipboard</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    wl-clipboard + a paste chord · lands anywhere, x11 too
                  </TooltipContent>
                </Tooltip>
                <p className="cell-where">anywhere · x11 too</p>
                <p>
                  Sets the clipboard and sends a paste chord. Layout-agnostic and
                  works on everything. The fallback that always lands.
                </p>
                <div className="cost">
                  <b>cost:</b> your clipboard is overwritten
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap sec-in">
          <div className="tag">
            the&nbsp;<b>panel</b>
          </div>
          <div className="body-col">
            <h2>
              Pick a microphone by watching a bar move, not by trusting a device
              name.
            </h2>
            <p>
              <code>whisprd-menu</code> is the settings and history panel — GJS
              and GTK4, sharing nothing with the daemon but a config file, a{" "}
              <code>SIGHUP</code> and the journal. The daemon keeps no GUI
              dependencies and still runs headless.
            </p>
            <p>
              It carries a live level meter on the selected source, because a
              wrong source is the single biggest cause of nonsense transcripts.
              Whisper does not answer silence with an empty string; it answers
              with caption boilerplate memorised from its training data —{" "}
              <em>Thank you.</em>, <em>Subtitles by the Amara.org community</em>,
              a stray copyright line. whisprd refuses to send anything peaking
              below 2 % of full scale and tells you the level it measured.
            </p>
            <p>
              With <code>history = on</code> it also keeps past sessions, in{" "}
              <code>0600</code> files inside a <code>0700</code> directory. It is
              off by default — a verbatim record of everything said at a machine
              should be something you switch on, not something you find later.
            </p>
          </div>
        </div>
      </section>

      <section className="sec" id="install">
        <div className="wrap sec-in">
          <div className="tag">
            get&nbsp;<b>it running</b>
          </div>
          <div className="body-col">
            <h2>Clone it and run the installer.</h2>
            <p className="lede">
              You need an OpenAI API key first — whisprd will not start without
              one. Fedora, Debian/Ubuntu and Arch are handled; anything else
              falls through with a warning and lets the build name what is
              missing.
            </p>
            <div className="code">
              <div className="code-h">
                <span>shell</span>
                <CopyButton
                  text={
                    "git clone https://github.com/ajr-khll/linux-transcription\ncd linux-transcription\n./install.sh"
                  }
                />
              </div>
              <pre>
                <span className="p">$</span>
                {" git clone https://github.com/ajr-khll/linux-transcription\n"}
                <span className="p">$</span>
                {" cd linux-transcription\n"}
                <span className="p">$</span>
                {" ./install.sh"}
              </pre>
            </div>
            <p>
              It installs dependencies, builds, adds you to the{" "}
              <code>input</code> group, seeds the config, asks for your key and
              enables the systemd user service.{" "}
              <strong>Log out and back in afterwards</strong> — group membership
              is read when your session starts, so until then the service cannot
              open <code>/dev/uinput</code>.
            </p>
            <p>
              It is deliberately not a <code>curl | bash</code> one-liner. This
              needs sudo, and piping an unread script into a shell that then asks
              for your password is a habit worth not teaching.
            </p>
            <div className="code">
              <div className="code-h">
                <span>then</span>
                <CopyButton
                  text={
                    'whisprd --list-sources\nwhisprd --say "hello"\nwhisprd-menu'
                  }
                />
              </div>
              <pre>
                <span className="p">$</span>
                {" whisprd --list-sources   "}
                <span className="c"># samples each device, prints its peak level</span>
                {"\n"}
                <span className="p">$</span>
                {' whisprd --say "hello"    '}
                <span className="c"># test injection without speaking</span>
                {"\n"}
                <span className="p">$</span>
                {" whisprd-menu             "}
                <span className="c"># settings and history</span>
              </pre>
            </div>
            <p>
              Do not run it as root. It reads <code>/dev/input/event*</code> and
              writes <code>/dev/uinput</code>; on most distributions both are{" "}
              <code>root:input</code>, so joining the group is enough.
            </p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap sec-in">
          <div className="tag">
            honest&nbsp;<b>status</b>
          </div>
          <div className="body-col">
            <h2>What is built, and what is not.</h2>
            <p className="lede">
              This is pre-release. <code>TODO.md</code> in the repo carries the
              full list, including the gaps that matter before anyone calls it
              1.0.
            </p>
            <div className="rows">
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  Config, evdev hotkey, epoll input loop
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  Persistent 16 kHz capture and gating
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  In-memory WAV, multipart POST, JSON parse
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  <code>wlr-vk</code> backend — Hyprland, Sway, river, Wayfire
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  <code>clipboard</code> backend — universal fallback
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot">●</span>
                <span className="row-t">
                  <code>uinput</code> backend — GNOME, KDE
                </span>
                <Badge variant="shipped" className="row-badge">implemented</Badge>
              </div>
              <div className="row">
                <span className="row-dot idle">○</span>
                <span className="row-t">
                  <code>x11-xtest</code> backend
                </span>
                <Badge variant="planned" className="row-badge">not yet</Badge>
              </div>
              <div className="row">
                <span className="row-dot idle">○</span>
                <span className="row-t">Spend limit on API calls</span>
                <Badge variant="planned" className="row-badge">not yet</Badge>
              </div>
            </div>
            <p style={{ marginTop: "1.3rem" }}>
              Known gaps worth naming: the <code>uinput</code> backend drops
              characters needing dead-key or compose sequences, the clipboard
              backend does not restore what it overwrote, and one paste chord
              applies to every app — so a config tuned for terminals behaves
              oddly everywhere else.
            </p>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-row">
            <span>
              <span className="fkey">↗</span>{" "}
              <a href={REPO}>github.com/ajr-khll/linux-transcription</a>
            </span>
            <span>
              <span className="fkey">§</span> GPL-3.0-only
            </span>
            <span>
              <span className="fkey">·</span> C · GJS · GTK4
            </span>
          </div>
          <div>
            Written for Linux desktops. The vendored virtual-keyboard protocol is
            MIT, and stays that way.
          </div>
        </div>
      </footer>
     </TooltipProvider>
    </div>
  );
}
