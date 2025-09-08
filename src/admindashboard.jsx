import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "./App.jsx";

/* local helpers */
function lsGetStore() {
  try {
    return JSON.parse(localStorage.getItem("reservations")) || {};
  } catch {
    return {};
  }
}
function toISODateLocal(d = new Date()) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}
function normalizeDate(dstr) {
  if (!dstr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dstr)) return dstr;
  const d = new Date(dstr);
  return isNaN(d) ? "" : toISODateLocal(d);
}

export default function Admin() {
  const [date, setDate] = useState(() => toISODateLocal(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const token = localStorage.getItem("token");

  async function fetchApiByDate(d) {
    const res = await fetch(`${API_URL}/api/reservations?date=${encodeURIComponent(d)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.replace("#/parispublogin");
      return [];
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function fetchApiAll() {
    const res = await fetch(`${API_URL}/api/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.replace("#/parispublogin");
      return [];
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  function fetchLocalByDate(d) {
    const store = lsGetStore();
    const list = (store[d] || []).map((r, i) => ({
      _id: `ls_${d}_${i}`,
      name: r.name,
      email: r.email,
      phone: r.phone,
      partySize: r.people,
      date: d,
      time: r.time,
      createdAt: r.createdAt || Date.now(),
    }));
    return list;
  }

  function fetchLocalAll() {
    const store = lsGetStore();
    return Object.entries(store).flatMap(([d, arr]) =>
      (arr || []).map((r, i) => ({
        _id: `ls_${d}_${i}`,
        name: r.name,
        email: r.email,
        phone: r.phone,
        partySize: r.people,
        date: d,
        time: r.time,
        createdAt: r.createdAt || Date.now(),
      }))
    );
  }

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const list = token ? await fetchApiByDate(date) : fetchLocalByDate(date);
      setRows(list);
    } catch (e) {
      setRows(fetchLocalByDate(date));
      setErr("Showing local data because the server request failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function downloadCSV() {
    const header = ["Name", "Email", "Phone", "People", "Date", "Time", "Created"];
    const body = rows.map((r) => [
      r.name || "",
      r.email || "",
      r.phone || "",
      r.partySize ?? "",
      normalizeDate(r.date) || date || "",
      r.time || "",
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ]);
    const csv = [header, ...body].map((a) => a.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations_${date || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function showAll() {
    setLoading(true);
    setErr("");
    try {
      const list = token ? await fetchApiAll() : fetchLocalAll();
      setRows(list);
    } catch (e) {
      setRows(fetchLocalAll());
      setErr("Showing local data because the server request failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id) {
    if (!window.confirm("Cancel this reservation")) return;
    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/reservations/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Delete failed");
        await load();
        return;
      }
      throw new Error("No API");
    } catch {
      const store = lsGetStore();
      if (store[date]) {
        store[date] = store[date].filter((_, idx) => `ls_${date}_${idx}` !== id);
        localStorage.setItem("reservations", JSON.stringify(store));
      }
      await load();
    }
  }

  return (
    <section className="section">
      <div className="container">
        {/* quick admin actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 10 }}>
          <Link to="/admin/menu" className="btn primary">Edit Menu</Link>
          <Link to="/admin/events" className="btn primary">Edit Events</Link>
        </div>

        <h2>Reservations</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button className="btn" onClick={showAll} disabled={loading}>
            Show all
          </button>
          <button className="btn primary" onClick={downloadCSV} disabled={rows.length === 0}>
            Download CSV
          </button>
        </div>

        {err && (
          <div className="alert err" style={{ marginTop: 10 }}>
            {err}
          </div>
        )}

        <div className="card" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>People</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan="7">No reservations</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.partySize}</td>
                  <td>{normalizeDate(r.date)}</td>
                  <td>{r.time}</td>
                  <td>
                    <button className="btn" onClick={() => cancel(r._id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="7">Loading…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
