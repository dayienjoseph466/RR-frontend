import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

/* helpers */
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function getStore() {
  try { return JSON.parse(localStorage.getItem("reservations")) || {}; }
  catch { return {}; }
}
function setStore(obj) { localStorage.setItem("reservations", JSON.stringify(obj)); }
function saveReservation(dateISO, record) {
  const store = getStore();
  if (!store[dateISO]) store[dateISO] = [];
  store[dateISO].push(record);
  setStore(store);
}
function labelFromHHMM(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const isPM = h >= 12;
  const hour12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, "0");
  return `${hour12}:${mm} ${isPM ? "p.m." : "a.m."}`;
}
function addMinutesHHMM(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
function isClosedDay(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const dow = d.getDay();
  return dow === 1 || dow === 2;
}
const STEP_MINUTES = Number(import.meta.env.VITE_SLOT_MINUTES || 30);

/* side gallery data */
const TABLE_IMAGE_COUNT = 10;
const tableImageList = Array.from({ length: TABLE_IMAGE_COUNT }, (_, i) => i + 1);

/* small helper component so we can fall back to .jpg if .png is not found */
function TableImage({ n, alt }) {
  const [src, setSrc] = useState(`/Pub${n}.png`);
  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        if (!src.endsWith(".jpg")) setSrc(`/Pub${n}.jpg`);
      }}
      style={{
        width: "100%",
        height: 120,
        objectFit: "cover",
        borderRadius: 10,
        display: "block",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}
    />
  );
}

export default function Reserve() {
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [time, setTime] = useState("");
  const [durationSlots, setDurationSlots] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [slots, setSlots] = useState([]);
  const [disabledSlots, setDisabledSlots] = useState(new Set());

  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [isClosed, setIsClosed] = useState(false);
  const [hoursNote, setHoursNote] = useState("");

  // NEW: trigger refresh after popup closes
  const [refreshTick, setRefreshTick] = useState(0);
  function refreshAvailability() {
    setRefreshTick(t => t + 1);
  }

  useEffect(() => {
    setTime("");
    setErrMsg("");
    setDisabledSlots(new Set());

    if (isClosedDay(date)) {
      setIsClosed(true);
      setHoursNote("Closed on Mondays and Tuesdays");
    } else {
      setIsClosed(false);
      setHoursNote("");
    }

    fetch(`${API_URL}/api/availability?date=${date}&partySize=${people}&durationSlots=${durationSlots}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const arr = Array.isArray(d.slots) ? d.slots : [];
        setSlots(arr.map(t => ({ value: t, label: labelFromHHMM(t) })));
        if (arr.length === 0) {
          setIsClosed(true);
          if (!isClosedDay(date)) setHoursNote("Closed on this day");
        }
      })
      .catch(() => {
        setSlots([]);
        setIsClosed(true);
        if (!isClosedDay(date)) setHoursNote("Closed on this day");
      });
  }, [date, people, durationSlots, refreshTick]); // added refreshTick

  async function submit(e) {
    e.preventDefault();
    setErrMsg("");

    if (isClosed) return setErrMsg("Closed on this day");

    const fullName = name.trim();
    const mail = email.trim();
    const phoneNum = phone.trim();

    if (!time)  return setErrMsg("Please pick a time");
    if (!fullName) return setErrMsg("Please enter your name");
    if (!mail) return setErrMsg("Please enter your email");
    if (!phoneNum) return setErrMsg("Please enter your phone");

    const dateISO = date;
    const serverTime = slots.find(s => s.label === time)?.value || time;

    saveReservation(dateISO, {
      name: fullName,
      email: mail,
      phone: phoneNum,
      people: Number(people),
      time,
      durationSlots,
      createdAt: Date.now(),
    });

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: mail,
          phone: phoneNum,
          partySize: Number(people),
          date: dateISO,
          time: serverTime,
          durationSlots: Number(durationSlots),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409 || /slot full/i.test(data?.message || "")) {
          setDisabledSlots(prev => new Set([...prev, serverTime]));
          setTime("");
        }
        setErrMsg(data.message || "Could not book. Try another time.");
        return;
      }

      const endHHMM = addMinutesHHMM(serverTime, STEP_MINUTES * Number(durationSlots));
      const startLabel = labelFromHHMM(serverTime);
      const endLabel = labelFromHHMM(endHHMM);
      setModalText(
        `Thank you for reserving a table at Paris Pub for ${people} ${people === 1 ? "person" : "people"} on ${dateISO} from ${startLabel} to ${endLabel}. Your booking is confirmed. See you soon.`
      );
      setShowModal(true);

      setTime("");
      setName("");
      setEmail("");
      setPhone("");
    } catch {
      setErrMsg("Network issue. Your booking was saved locally.");
    } finally {
      setSaving(false);
    }
  }

  const durationChoices = [
    { slots: 1, label: `${STEP_MINUTES} minutes` },
    { slots: 2, label: `${STEP_MINUTES * 2} minutes` },
    { slots: 3, label: `${STEP_MINUTES * 3} minutes` },
    { slots: 4, label: `${STEP_MINUTES * 4} minutes` }
  ];

  return (
    <section className="section">
      <div className="container">
        {/* make the form and the images sit side by side */}
        <div
          className="reserve-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 24,
            alignItems: "start"
          }}
        >
          <form className="reserve-card" onSubmit={submit}>
            <h2>Make a reservation</h2>

            {hoursNote && <div className="alert" style={{ marginBottom: 12 }}>{hoursNote}</div>}
            {errMsg && <div className="alert err" style={{ marginBottom: 12 }}>{errMsg}</div>}

            <div className="field-row">
              <label className="field-label">People</label>
              <div className="field-ctrl">
                <select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <label className="field-label">Duration</label>
              <div className="field-ctrl">
                <select value={durationSlots} onChange={(e) => setDurationSlots(Number(e.target.value))}>
                  {durationChoices.map(opt => (
                    <option key={opt.slots} value={opt.slots}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-col">
                <label className="field-label">Date</label>
                <div className="field-ctrl">
                  <input type="date" value={date} min={tomorrowISO()} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div className="field-col">
                <label className="field-label">Time</label>
                <div className="field-ctrl">
                  <input
                    type="text"
                    placeholder="choose a slot below"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="slots">
              <div className="slots-label">Select a time</div>
              <div className="slots-grid">
                {slots.map(s => {
                  const isDisabled = disabledSlots.has(s.value);
                  return (
                    <button
                      type="button"
                      key={s.value}
                      className={`slot ${time === s.label ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                      onClick={() => { if (!isDisabled) setTime(s.label); }}
                      disabled={isDisabled}
                      title={s.value}
                    >
                      {s.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="slot outline"
                  onClick={() => alert("We will notify you when a table opens")}
                >
                  Notify me
                </button>
              </div>
            </div>

            <div className="mini-info">
              <div>
                Experiences are available. <a href="#">See details</a>
              </div>
            </div>

            <div className="field-grid tight">
              <div className="field-col">
                <label className="field-label">Full name</label>
                <div className="field-ctrl">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
              </div>
              <div className="field-col">
                <label className="field-label">Email</label>
                <div className="field-ctrl">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </div>
              <div className="field-col">
                <label className="field-label">Phone</label>
                <div className="field-ctrl">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555 123 4567" />
                </div>
              </div>
            </div>

            <button className="btn primary wide" type="submit" disabled={saving || isClosed}>
              {saving ? "Saving..." : "Confirm Booking"}
            </button>
          </form>

          {/* right side gallery with Pub1..Pub10 from public */}
          <aside
            aria-label="Table images"
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
            }}
          >
            <h3 style={{ margin: "4px 0 12px", fontSize: 18 }}>Tables</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12
              }}
            >
              {tableImageList.map(n => (
                <div key={n}>
                  <TableImage n={n} alt={`Table ${n}`} />
                  <div style={{ textAlign: "center", marginTop: 6, fontWeight: 600, fontSize: 14 }}>
                    Table {n}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Booking confirmed</h3>
            <p style={{ marginBottom: 16 }}>{modalText}</p>
            <button
              className="btn primary"
              onClick={() => {
                setShowModal(false);
                refreshAvailability(); // REFRESH after closing popup
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
