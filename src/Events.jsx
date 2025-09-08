import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

/* ------- helpers ------- */
function monthLabel(d) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(d).toUpperCase();
}
function dayLabel(d) {
  return String(d.getDate()).padStart(2, "0");
}
function dateLine(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const dayStr1 = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d1);
  const t1 = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(d1);
  const t2 = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(d2);
  const sameDay = d1.toDateString() === d2.toDateString();
  if (sameDay) return `${dayStr1}, ${t1} to ${t2}`;
  const dayStr2 = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d2);
  return `${dayStr1}, ${t1} to ${dayStr2}, ${t2}`;
}

/** Normalize an image/video path into a usable URL for the browser. */
function resolveUrl(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;               // already absolute
  if (src.startsWith("/uploads")) return `${API_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_URL}/${src}`;
  if (src.startsWith("/")) return src;                  // from /public
  return `/${src}`;                                     // last resort
}

/* ------- page ------- */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        // sort soonest first
        arr.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(arr);
      } catch (e) {
        console.error(e);
        setErr("Couldn’t load events right now.");
      }
    })();
  }, []);

  return (
    <main className="events-wrap">
      <div className="events-container">
        <h1 className="events-title">Events at Paris Pub</h1>
        <p className="events-sub">Live music, patio parties, and special nights. See what is coming up.</p>

        {err && <div className="alert err" style={{ marginBottom: 16 }}>{err}</div>}

        <ul className="event-list">
          {events.length === 0 && !err && (
            <li style={{ listStyle: "none", opacity: 0.7 }}>No events</li>
          )}

          {events.map((evt) => {
            const sd = new Date(evt.start);
            const mediaType = evt.mediaType || "image";
            const mediaUrl = resolveUrl(evt.mediaUrl);
            const posterUrl = resolveUrl(evt.posterUrl);

            return (
              <li key={evt._id || evt.id} className="event-card">
                <div className="event-date">
                  <span className="event-month">{monthLabel(sd)}</span>
                  <span className="event-day">{dayLabel(sd)}</span>
                </div>

                <div className="event-main">
                  <h2 className="event-title">{evt.title}</h2>
                  <div className="event-time">{dateLine(evt.start, evt.end)}</div>

                  <div className="event-media">
                    {mediaType === "video" ? (
                      <video
                        className="event-video"
                        src={mediaUrl}
                        poster={posterUrl || undefined}
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        className="event-image"
                        src={mediaUrl}
                        alt={evt.title || "event image"}
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
