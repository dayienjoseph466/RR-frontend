import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

const FALLBACK = [
  { id: 1, name: "Cheesecake", desc: "Creamy slice", price: 5.99, img: "/cheesecake.jpeg" },
  { id: 2, name: "Brownie", desc: "Warm chocolate", price: 4.99, img: "/brownie.jpg" },
];

export default function MenuDesserts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${API_URL}/api/admin/menu?category=desserts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (r.ok) {
          const data = await r.json();
          if (!cancelled) setItems(data);
        } else {
          const r2 = await fetch(`${API_URL}/api/menu?category=desserts`);
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
        <h2>Desserts</h2>

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
