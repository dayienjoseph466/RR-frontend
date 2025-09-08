import React, { useEffect, useState } from "react";
import { API_URL } from "../App.jsx";

export default function AdminEventsEditor() {
  const token = localStorage.getItem("token");
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : {};
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);

  // Make any stored path displayable in the browser
  function resolveMedia(src) {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/uploads")) return `${API_URL}${src}`;
    if (src.startsWith("uploads/")) return `${API_URL}/${src}`;
    if (src.startsWith("/")) return src; // from /public
    return `/${src}`;
  }

  async function load() {
    const r = await fetch(`${API_URL}/api/admin/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = r.ok ? await r.json() : [];
    setRows(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setEditing({
      _id: null,
      title: "",
      desc: "",
      start: "",
      end: "",
      mediaType: "image", // image | video
      mediaUrl: "",
      posterUrl: "",
      mediaSource: "url", // url | upload
      active: true,
    });
    setShow(true);
  }
  function openEdit(e) {
    setEditing({ ...e, mediaSource: "url" });
    setShow(true);
  }

  async function save() {
    const body = {
      title: editing.title,
      desc: editing.desc,
      start: editing.start ? new Date(editing.start) : null,
      end: editing.end ? new Date(editing.end) : null,
      mediaType: editing.mediaType,
      mediaUrl: editing.mediaUrl,
      posterUrl: editing.posterUrl,
      active: !!editing.active,
    };
    if (editing._id) {
      await fetch(`${API_URL}/api/admin/events/${editing._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`${API_URL}/api/admin/events`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }
    setShow(false);
    await load();
  }

  async function remove(id) {
    if (!window.confirm("Delete this event")) return;
    await fetch(`${API_URL}/api/admin/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  }

  // ✅ Authenticated upload with clear error messages
  async function upload(file) {
    if (!token) {
      alert("Please log in again before uploading.");
      return null;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // important!
        body: fd, // do NOT set Content-Type manually
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        // Common reasons: 401 invalid token, 413 file too large, 400 unsupported type
        alert(`Upload failed (${r.status}). ${txt}`);
        return null;
      }
      const data = await r.json();
      return data?.url || null;
    } catch (e) {
      console.error(e);
      alert("Upload failed. Check server logs.");
      return null;
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="adminHead">
          <h2 className="adminTitle">Events Manager</h2>
          <div className="adminActions">
            <button className="btn primary" onClick={openNew}>
              Add event
            </button>
          </div>
        </div>

        <div className="adminCard">
          <table className="table adminTable">
            <thead>
              <tr>
                <th>Media</th>
                <th>Title</th>
                <th>When</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e._id}>
                  <td>
                    {e.mediaType === "video" ? (
                      <video
                        className="preview"
                        src={resolveMedia(e.mediaUrl)}
                        poster={resolveMedia(e.posterUrl || "")}
                        onError={(ev) => (ev.currentTarget.style.visibility = "hidden")}
                      />
                    ) : (
                      <img
                        className="preview"
                        src={resolveMedia(e.mediaUrl)}
                        alt=""
                        onError={(ev) => (ev.currentTarget.style.visibility = "hidden")}
                      />
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td>
                    {new Date(e.start).toLocaleString()} →{" "}
                    {new Date(e.end).toLocaleString()}
                  </td>
                  <td>
                    {e.active ? (
                      <span className="badge">Yes</span>
                    ) : (
                      <span
                        className="badge"
                        style={{ background: "#fee2e2", color: "#991b1b" }}
                      >
                        No
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn" onClick={() => openEdit(e)}>
                      Edit
                    </button>{" "}
                    <button
                      className="btn danger"
                      onClick={() => remove(e._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="5">No events</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {show && editing && (
        <div className="modal open">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editing._id ? "Edit event" : "Add event"}</h3>
              <button className="btn" onClick={() => setShow(false)}>✕</button>
            </div>

            <div className="modal-body modalForm">
              <div className="field">
                <label>Title</label>
                <input
                  className="input"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={editing.desc}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, desc: e.target.value }))
                  }
                />
              </div>

              <div className="modalRow">
                <div className="field">
                  <label>Start</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={editing.start}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, start: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>End</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={editing.end}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, end: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="modalRow">
                <div className="field">
                  <label>Media type</label>
                  <select
                    className="input"
                    value={editing.mediaType}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, mediaType: e.target.value }))
                    }
                  >
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                </div>
                <div className="field">
                  <label>Poster URL (video optional)</label>
                  <input
                    className="input"
                    placeholder="https://…"
                    value={editing.posterUrl || ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, posterUrl: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label>Media</label>
                <div className="radioRow">
                  <label>
                    <input
                      type="radio"
                      checked={editing.mediaSource === "url"}
                      onChange={() =>
                        setEditing((s) => ({ ...s, mediaSource: "url" }))
                      }
                    />{" "}
                    URL
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={editing.mediaSource === "upload"}
                      onChange={() =>
                        setEditing((s) => ({ ...s, mediaSource: "upload" }))
                      }
                    />{" "}
                    Upload
                  </label>
                </div>

                {editing.mediaSource === "url" ? (
                  <input
                    className="input"
                    placeholder="https://…"
                    value={editing.mediaUrl}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, mediaUrl: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    className="input"
                    type="file"
                    accept={editing.mediaType === "video" ? "video/*" : "image/*"}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await upload(f);
                      if (url) setEditing((s) => ({ ...s, mediaUrl: url }));
                    }}
                  />
                )}

                {editing.mediaUrl &&
                  (editing.mediaType === "video" ? (
                    <video
                      className="preview"
                      src={resolveMedia(editing.mediaUrl)}
                      poster={resolveMedia(editing.posterUrl || "")}
                    />
                  ) : (
                    <img
                      className="preview"
                      src={resolveMedia(editing.mediaUrl)}
                      alt="preview"
                    />
                  ))}
              </div>

              <div className="field">
                <label>
                  <input
                    type="checkbox"
                    checked={!!editing.active}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, active: e.target.checked }))
                    }
                  />{" "}
                  Active
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
