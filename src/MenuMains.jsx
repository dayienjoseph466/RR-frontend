import React, { useEffect, useState } from "react";
import { API_URL } from "./App.jsx";

const FALLBACK = [
  { id: 1, name: "Classic Crispy Fries (Small)", desc: "Exactly as you want pub fries! Seasoned and golden perfection.", price: 8.0, img: "/crispy-fries.jpeg" },
  { id: 2, name: "Classic Crispy Fries (Large)", desc: "Exactly as you want pub fries! Seasoned and golden perfection.", price: 10.0, img: "/crispy-fries.jpeg" },
  { id: 3, name: "Onion Rings (Small)", desc: "Beer battered and dusted in golden crispy batter, served with house dill dip.", price: 8.0, img: "/onion-rings.jpg" },
  { id: 4, name: "Onion Rings (Large)", desc: "Beer battered and dusted in golden crispy batter, served with house dill dip.", price: 11.0, img: "/onion-rings.jpg" },
  { id: 5, name: "Loaded Crispy Fries", desc: "Golden fries piled high, smothered in warm cheese sauce, bacon, green onions, sour cream, and zesty guacamole.", price: 12.0, img: "/loaded-fries.jpg" },
  { id: 6, name: "Sweet Potato Fries", desc: "Crispy sweet potato fries with garlic aioli for dipping.", price: 12.0, img: "/sweet-potato-fries.jpg" },
  { id: 7, name: "Classic Paris Pub Poutine (Small)", desc: "Golden fries topped with savoury gravy and cheese curds.", price: 10.0, img: "/poutine.jpeg" },
  { id: 8, name: "Classic Paris Pub Poutine (Large)", desc: "Golden fries topped with savoury gravy and cheese curds.", price: 13.0, img: "/poutine.jpeg" },

  { id: 9, name: "House Salad", desc: "Light and refreshing, mixed greens tossed with house dressing.", price: 13.0, img: "/house-salad.jpg" },
  { id: 10, name: "Caesar Salad", desc: "Crisp romaine, smoky bacon, parmesan, croutons, creamy Caesar dressing.", price: 14.0, img: "/caesar-salad.jpg" },
  { id: 11, name: "Mediterranean Salad", desc: "Romaine lettuce, cucumber, tomato, red onion, olives, and feta with Greek dressing.", price: 14.0, img: "/mediterranean-salad.jpeg" },
  { id: 12, name: "Paris Pub Caesar Salad", desc: "A fan favourite Caesar salad with the Paris Pub twist.", price: 18.0, img: "/paris-caesar-salad.jpg" },
  { id: 13, name: "Taco Salad", desc: "Served in a crisp tortilla bowl with seasoned beef, lettuce, tomato, cheese, salsa, sour cream.", price: 17.0, img: "/taco-salad.jpg" },
  { id: 14, name: "Feature Salad", desc: "Ask your server about the fresh, locally inspired seasonal salad.", price: 16.0, img: "/feature-salad.jpg" },

  { id: 15, name: "Herb Crusted Haddock", desc: "Baked fillet of haddock topped with lemon and herbs, served with your choice of side.", price: 19.0, img: "/herb-haddock.jpg" },
  { id: 16, name: "Chicken Fingers & Fries", desc: "Crispy fried chicken fingers served with house cut fries and plum sauce.", price: 16.0, img: "/chicken-fingers.jpg" },
  { id: 17, name: "Traditional English Pub Fish & Chips", desc: "Ale battered haddock fillet, house fries, tartar sauce.", price: 18.0, img: "/fish-chips.jpg" },
  { id: 18, name: "Quesadilla", desc: "Flour tortilla filled with melted cheese, roasted veggies, and spices. Served with salsa and sour cream.", price: 16.0, img: "/quesadilla.jpg" },

  { id: 19, name: "Nanny Mo Bowtie Pasta", desc: "Bowtie pasta in vodka tomato cream sauce with chicken, sundried tomato, parmesan.", price: 23.0, img: "/bowtie-pasta.jpeg" },
  { id: 20, name: "Paris Pub Protein Bowl", desc: "Rice bowl with seasonal vegetables, your choice of grilled chicken or tofu, tossed in house sauce.", price: 20.0, img: "/protein-bowl.jpg" },
  { id: 21, name: "Chicken Wings (1 lb)", desc: "Pub style wings with your choice of flavour. Served with dipping sauce.", price: 19.0, img: "/wings.jpeg" },

  { id: 22, name: "The Classic Pub Smash Burger", desc: "Two smashed patties, lettuce, tomato, onion, garlic aioli. Served with house fries.", price: 17.0, img: "/smash-burger.jpg" },
  { id: 23, name: "Build It Burger", desc: "Customize your burger with cheese, bacon, mushrooms, jalapeños, and more.", price: 12.0, img: "/build-burger.jpg" },
  { id: 24, name: "Chicken Caesar Wrap", desc: "Grilled chicken, parmesan, romaine, Caesar dressing wrapped in a flour tortilla.", price: 17.0, img: "/chicken-caesar-wrap.jpg" },
  { id: 25, name: "The Clubhouse Reinvented", desc: "Triple decker sandwich with chicken, bacon, lettuce, tomato, mayo.", price: 19.0, img: "/clubhouse.jpeg" },
  { id: 26, name: "Pulled Pork Sandwich", desc: "Slow roasted pork shoulder piled high, topped with tangy BBQ sauce.", price: 18.0, img: "/pulled-pork.jpg" },
  { id: 27, name: "Veggie Burger", desc: "House made patty with grilled veggies, lettuce, tomato, onions, topped with garlic aioli.", price: 17.0, img: "/veggie-burger.jpg" },
  { id: 28, name: "Buffalo Chicken Wrap", desc: "Breaded chicken tenders tossed in buffalo sauce, wrapped with lettuce, tomato, ranch.", price: 19.0, img: "/buffalo-wrap.jpg" },
  { id: 29, name: "Bacon & Blue Burger", desc: "Pub burger topped with bacon, blue cheese, and garlic aioli.", price: 19.0, img: "/bacon-blue-burger.jpg" },
  { id: 30, name: "Paris Pub Donair", desc: "Marinated beef slices, onions, tomatoes, sweet donair sauce in a pita wrap.", price: 18.0, img: "/donair.jpg" }
];

export default function MenuMains() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${API_URL}/api/admin/menu?category=mains`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (r.ok) {
          const data = await r.json();
          if (!cancelled) setItems(data);
        } else {
          const r2 = await fetch(`${API_URL}/api/menu?category=mains`);
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
        <h2>Mains</h2>

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
