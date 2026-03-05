"use client";

import { useState } from "react";
import Window from "@/components/Window/Window";
import { useWindowManager, type WindowState } from "@/state/windowManager";

interface DialogWindowProps {
  win: WindowState;
}

type FormState = "idle" | "sending" | "sent" | "error";

/**
 * Contact form dialog — a smaller, non-resizable modal window.
 *
 * On submit it shows a classic Mac "alert" confirmation. The actual sending
 * uses a mailto: link as a zero-dependency fallback; swap in a Formspree or
 * API endpoint as needed.
 */
export default function DialogWindow({ win }: DialogWindowProps) {
  const closeWindow = useWindowManager((s) => s.closeWindow);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");

    // Fallback: open the user's mail client
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.open(`mailto:you@example.com?subject=${subject}&body=${body}`);

    setTimeout(() => setStatus("sent"), 600);
  }

  function handleOk() {
    closeWindow(win.id);
  }

  return (
    <Window win={win} forceNoResize>
      {status === "sent" ? (
        /* ── Confirmation alert ── */
        <div className="dialog-body" style={{ alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✉️</div>
          <p style={{ fontWeight: "bold", marginBottom: 4 }}>Message sent!</p>
          <p style={{ color: "#444", marginBottom: 20 }}>
            Your mail client should have opened. If not, email me directly at{" "}
            <a href="mailto:you@example.com" style={{ color: "#000" }}>
              you@example.com
            </a>
            .
          </p>
          <button className="sys7-btn sys7-btn--default" onClick={handleOk}>
            OK
          </button>
        </div>
      ) : (
        /* ── Contact form ── */
        <form className="dialog-body" onSubmit={handleSubmit} noValidate>
          <div className="dialog-icon-row">
            <span style={{ fontSize: 24, flexShrink: 0 }}>✉️</span>
            <p className="dialog-message">
              Send me a message! I read everything and try to reply within a day or two.
            </p>
          </div>

          <div className="dialog-field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              className="sys7-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              required
              autoComplete="name"
            />
          </div>

          <div className="dialog-field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              className="sys7-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@babbage.co"
              required
              autoComplete="email"
            />
          </div>

          <div className="dialog-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              className="sys7-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hello! I'd love to talk about…"
              rows={4}
              required
            />
          </div>

          <div className="dialog-buttons">
            <button
              type="button"
              className="sys7-btn"
              onClick={handleOk}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sys7-btn sys7-btn--default"
              disabled={status === "sending" || !name || !email || !message}
            >
              {status === "sending" ? "Sending…" : "Send ✉"}
            </button>
          </div>
        </form>
      )}
    </Window>
  );
}
