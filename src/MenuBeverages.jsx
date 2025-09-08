import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

const FALLBACK = [
  { id: 1, name: "Iced Tea", desc: "Lemon mint", price: 3.49, img: "/iced-tea.webp" },
  { id: 2, name: "Latte", desc: "Rich and smooth", price: 4.49, img: "/latte.jpg" },
];

export default function MenuBeverages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${API_URL}/api/admin/menu?category=beverages`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (r.ok) {
          const data = await r.json();
          if (!cancelled) setItems(data);
        } else {
          const r2 = await fetch(`${API_URL}/api/menu?category=beverages`);
          if (r2.ok) {
            const data2 = await r2.json();
            if (!cancelled) setItems(data2);
          } else {
            if (!cancelled) setItems(FALLBACK);
          }
        }
      } catch {
        if (!cancelled) setItems(FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = items.length ? items : FALLBACK;

  return (
    <section className="section">
      <div className="container">
        <h2>Beverages</h2>

        {loading && <p style={{ color: "#6b7280", marginBottom: 12 }}>Loading…</p>}

        <div className="grid menu-grid">
          {list.map((it) => {
            const key = it._id || it.id;
            const img = it.imageUrl || it.img;
            const price = typeof it.price === "number" ? it.price : Number(it.price || 0);
            return (
              <article key={key} className="card dish">
                <img className="dish-img" src={img} alt={it.name} />
                <div className="dish-body">
                  <div className="dish-top">
                    <h3 className="dish-name">{it.name}</h3>
                    <span className="price">${price.toFixed(2)}</span>
                  </div>
                  <p className="dish-desc">{it.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
