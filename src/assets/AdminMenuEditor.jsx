import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../App.jsx";

export default function AdminMenuEditor() {
  const token = localStorage.getItem("token");
  const [category, setCategory] = useState("appetizers");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // object or null
  const [showModal, setShowModal] = useState(false);
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : {};

  // --- NEW: normalize any image path into a usable URL
  function resolveImg(src) {
    if (!src) return "";
    if (src.startsWith("http")) return src;                 // already absolute
    if (src.startsWith("/uploads")) return `${API_URL}${src}`;
    if (src.startsWith("uploads/")) return `${API_URL}/${src}`;
    if (src.startsWith("/")) return src;                    // from /public
    return `/${src}`;                                       // last resort
  }

  async function load() {
    const r = await fetch(
      `${API_URL}/api/admin/menu?category=${category}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = r.ok ? await r.json() : [];
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [category]);

  function openNew() {
    setEditing({
      _id: null,
      category,
      name: "",
      desc: "",
      priceStr: "",
      imageUrl: "",
      available: true,
      sortOrder: 0,
      imageSource: "url" // url | upload
    });
    setShowModal(true);
  }

  function openEdit(it) {
    setEditing({
      ...it,
      priceStr: it.price?.toString?.() ?? "",
      imageSource: "url"
    });
    setShowModal(true);
  }

  async function save() {
    const body = {
      category: editing.category,
      name: editing.name,
      desc: editing.desc,
      price: Number(editing.priceStr || 0),
      imageUrl: editing.imageUrl,
      available: !!editing.available,
      sortOrder: Number(editing.sortOrder || 0),
    };
    if (editing._id) {
      await fetch(`${API_URL}/api/admin/menu/${editing._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`${API_URL}/api/admin/menu`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }
    setShowModal(false);
    await load();
  }

  async function remove(id) {
    if (!window.confirm("Delete this item")) return;
    await fetch(`${API_URL}/api/admin/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  }

  // ✅ Send the Authorization header so protected /api/upload works
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        alert(`Upload failed (${r.status}). ${msg || ""}`);
        return;
      }
      const data = await r.json();
      if (data?.url) {
        setEditing((s) => ({ ...s, imageUrl: data.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check server logs.");
    }
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const k = q.toLowerCase();
    return items.filter(
      (x) =>
        x.name?.toLowerCase().includes(k) ||
        x.desc?.toLowerCase().includes(k)
    );
  }, [items, q]);

  return (
    <section className="section">
      <div className="container">
        <div className="adminHead">
          <h2 className="adminTitle">Menu Manager</h2>
        </div>

        <div className="adminCard">
          <div className="adminBar">
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="appetizers">appetizers</option>
              <option value="mains">mains</option>
              <option value="beverages">beverages</option>
              <option value="desserts">desserts</option>
            </select>
            <input
              className="input"
              placeholder="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn primary" onClick={openNew}>
              Add item
            </button>
          </div>

          <table className="table adminTable">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it._id}>
                  <td>
                    <img
                      src={resolveImg(it.imageUrl || it.img)}
                      alt=""
                      className="preview"
                      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>{it.desc}</div>
                  </td>
                  <td>${Number(it.price || 0).toFixed(2)}</td>
                  <td>
                    {it.available ? (
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
                    <button className="btn" onClick={() => openEdit(it)}>
                      Edit
                    </button>{" "}
                    <button className="btn danger" onClick={() => remove(it._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && editing && (
        <div className="modal open">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editing._id ? "Edit item" : "Add item"}</h3>
              <button className="btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body modalForm">
              <div className="field">
                <label>Name</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, name: e.target.value }))
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
                  <label>Price</label>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={editing.priceStr}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, priceStr: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Sort order</label>
                  <input
                    className="input"
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, sortOrder: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label>Image</label>
                <div className="radioRow">
                  <label>
                    <input
                      type="radio"
                      checked={editing.imageSource === "url"}
                      onChange={() =>
                        setEditing((s) => ({ ...s, imageSource: "url" }))
                      }
                    />{" "}
                    URL
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={editing.imageSource === "upload"}
                      onChange={() =>
                        setEditing((s) => ({ ...s, imageSource: "upload" }))
                      }
                    />{" "}
                    Upload
                  </label>
                </div>
                {editing.imageSource === "url" ? (
                  <input
                    className="input"
                    placeholder="https://…"
                    value={editing.imageUrl}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, imageUrl: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                  />
                )}
                {editing.imageUrl && (
                  <img
                    className="preview"
                    src={resolveImg(editing.imageUrl)}
                    alt="preview"
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              <div className="field">
                <label>
                  <input
                    type="checkbox"
                    checked={!!editing.available}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, available: e.target.checked }))
                    }
                  />{" "}
                  Available
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>
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
