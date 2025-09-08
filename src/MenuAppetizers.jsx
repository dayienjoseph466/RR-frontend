import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

const FALLBACK = [
  { id: 1, name: "Garlic & Cheese Stuffed Bread", desc: "Warm demi baguette stuffed with garlic butter and a gooey blend of cheeses, baked until golden and melty.", price: 12.0, img: "/garlic-bread.jpg" },
  { id: 2, name: "Honey Goat Cheese Bruschetta", desc: "Toasted crostini topped with creamy goat cheese and drizzled with local honey.", price: 16.0, img: "/bruschetta.jpg" },
  { id: 3, name: "Baja Fish Tacos", desc: "Three crispy haddock tacos with pico de gallo, orange-fennel slaw, and smoky chipotle aioli.", price: 18.0, img: "/fish-tacos.jpeg" },
  { id: 4, name: "Ploughman’s Board", desc: "A spread of local meats, cheeses, pickled bites, and other favourites. Perfect for sharing.", price: 25.0, img: "/ploughmans-board.jpg" },
  { id: 5, name: "Spinach & Artichoke Dip", desc: "Creamy spinach and artichoke dip served with naan and tortilla chips.", price: 15.0, img: "/spinach-dip.jpeg" },
  { id: 6, name: "Buffalo Cauliflower Bites", desc: "Golden-fried cauliflower in buffalo sauce with blue cheese and buttermilk ranch.", price: 14.0, img: "/cauliflower-bites.jpeg" },
  { id: 7, name: "Caprese on a Stick", desc: "Skewered bocconcini, ripe tomatoes, and basil with balsamic glaze.", price: 11.0, img: "/caprese.jpeg" },
  { id: 8, name: "Pub Style Mussels", desc: "Local mussels steamed in white wine broth with garlic, shallots, and cream.", price: 15.0, img: "/mussels.jpeg" },
  { id: 9, name: "Loaded Nachos", desc: "Fresh tortilla chips topped with cheese, bell peppers, onions, and tomatoes. Served with sour cream, pico de gallo, and guacamole.", price: 20.0, img: "/nachos.jpg" },
];

export default function MenuAppetizers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // try protected admin read if you are logged in
        const token = localStorage.getItem("token");
        const r = await fetch(`${API_URL}/api/admin/menu?category=appetizers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (r.ok) {
          const data = await r.json();
          if (!cancelled) setItems(data);
        } else {
          // optional public endpoint if you add it later
          const r2 = await fetch(`${API_URL}/api/menu?category=appetizers`);
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
        <h2>Appetizers</h2>

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
