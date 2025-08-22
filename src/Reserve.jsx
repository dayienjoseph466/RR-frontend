import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

/* ---------- helpers ---------- */
function toISODate(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}
function getStore() {
  try { return JSON.parse(localStorage.getItem("reservations")) || {}; }
  catch { return {}; }
}
function setStore(obj) {
  localStorage.setItem("reservations", JSON.stringify(obj));
}
function saveReservation(dateISO, record) {
  const store = getStore();
  if (!store[dateISO]) store[dateISO] = [];
  store[dateISO].push(record);
  setStore(store);
}
/* h:mm a.m./p.m. from "HH:MM" */
function labelFromHHMM(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const isPM = h >= 12;
  const hour12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, "0");
  return `${hour12}:${mm} ${isPM ? "p.m." : "a.m."}`;
}
/* add minutes to "HH:MM" and return "HH:MM" */
function addMinutesHHMM(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* slot step for confirmation end time: default 30, or override via VITE_SLOT_MINUTES */
const STEP_MINUTES = Number(import.meta.env.VITE_SLOT_MINUTES || 30);

/* ---------- component ---------- */
export default function Reserve() {
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [time, setTime] = useState(""); // label shown in the input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // slots from server: { value: "HH:MM", label: "h:mm a.m./p.m." }
  const [slots, setSlots] = useState([]);
  // disable buttons that turned full while user was on the page
  const [disabledSlots, setDisabledSlots] = useState(new Set());

  // modal confirmation
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // load slots
  useEffect(() => {
    setTime("");
    setErrMsg("");
    setDisabledSlots(new Set());

    fetch(`${API_URL}/api/availability?date=${date}&partySize=${people}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const arr = Array.isArray(d.slots) ? d.slots : [];
        setSlots(arr.map(t => ({ value: t, label: labelFromHHMM(t) })));
      })
      .catch(() => setSlots([]));
  }, [date, people]);

  async function submit(e) {
    e.preventDefault();
    setErrMsg("");

    const fullName = name.trim();
    const mail = email.trim();
    const phoneNum = phone.trim();

    if (!time)  return setErrMsg("Please pick a time");
    if (!fullName) return setErrMsg("Please enter your name");
    if (!mail) return setErrMsg("Please enter your email");
    if (!phoneNum) return setErrMsg("Please enter your phone");

    const dateISO = date;
    const serverTime = slots.find(s => s.label === time)?.value || time;

    // local fallback save
    saveReservation(dateISO, {
      name: fullName,
      email: mail,
      phone: phoneNum,
      people: Number(people),
      time,
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
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // handle full slot: gray it out, clear selection
        if (res.status === 409 || /slot full/i.test(data?.message || "")) {
          setDisabledSlots(prev => new Set([...prev, serverTime]));
          setTime("");
        }
        setErrMsg(data.message || "Could not book. Try another time.");
        return;
      }

      // success: build pop-up message using 30-minute window (or VITE_SLOT_MINUTES)
      const endHHMM = addMinutesHHMM(serverTime, STEP_MINUTES);
      const startLabel = labelFromHHMM(serverTime);
      const endLabel = labelFromHHMM(endHHMM);
      setModalText(
        `Thank you for reserving a table at Paris Pub for ${people} ${people === 1 ? "person" : "people"} on ${dateISO} from ${startLabel} to ${endLabel}. Your booking is confirmed. See you soon.`
      );
      setShowModal(true);

      // clear inputs
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

  return (
    <section className="section">
      <div className="container">
        <div className="reserve-wrap">
          <form className="reserve-card" onSubmit={submit}>
            <h2>Make a reservation</h2>

            {errMsg && <div className="alert err" style={{ marginBottom: 12 }}>{errMsg}</div>}

            {/* People */}
            <div className="field-row">
              <label className="field-label">People</label>
              <div className="field-ctrl">
                <select
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="field-grid">
              <div className="field-col">
                <label className="field-label">Date</label>
                <div className="field-ctrl">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
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

            {/* Slots */}
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

            {/* Info row */}
            <div className="mini-info">
              <div>
                Experiences are available. <a href="#">See details</a>
              </div>
            </div>

            {/* Contact fields */}
            <div className="field-grid tight">
              <div className="field-col">
                <label className="field-label">Full name</label>
                <div className="field-ctrl">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="field-col">
                <label className="field-label">Email</label>
                <div className="field-ctrl">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="field-col">
                <label className="field-label">Phone</label>
                <div className="field-ctrl">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555 123 4567"
                  />
                </div>
              </div>
            </div>

            <button className="btn primary wide" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>

      {/* modal pop-up */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Booking confirmed</h3>
            <p style={{ marginBottom: 16 }}>{modalText}</p>
            <button className="btn primary" onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </section>
  );
}
