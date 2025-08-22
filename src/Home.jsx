import React from "react";
import { Link } from "react-router-dom";

/* gallery images */
const gallery = [
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
  "/image-1.jpg",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200",
  "/restaurant1.jpg",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
];

/* menu items with photo and price
   put your photos in public/menu and update the paths */
const dishes = [
  {
    id: 1,
    name: "Tomato Soup",
    desc: "Warm and creamy",
    price: 6.99,
    img: "/tomato-soup.jpg",
    category: "Starters",
  },
  {
    id: 2,
    name: "Garlic Bread",
    desc: "Crispy with herbs",
    price: 5.49,
    img: "/garlic-bread.jpg",
    category: "Starters",
  },
  {
    id: 3,
    name: "Grilled Chicken",
    desc: "Served with veggies",
    price: 14.99,
    img: "/grilled-chicken.jpg",
    category: "Mains",
  },
  {
    id: 4,
    name: "Pasta Primavera",
    desc: "Fresh sauce and basil",
    price: 12.49,
    img: "/pasta-primavera.jpg",
    category: "Mains",
  },
  {
    id: 5,
    name: "Cheesecake",
    desc: "Rich and smooth",
    price: 6.49,
    img: "/cheesecake.jpeg",   // correct extension
    category: "Desserts",
  },
  {
    id: 6,
    name: "Iced Tea",
    desc: "Lemon and mint",
    price: 3.49,
    img: "/iced-tea.webp",     // correct extension
    category: "Beverages",
  },
];

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <h1>Welcome to Paris Pub</h1>
          <p>
            The Paris Pub has lived many lives. From its early days as Scotts Pharmacy to a beloved family run sandwich shop, a gritty watering hole known by locals as Cafe Europa, and now the vibrant and welcoming Paris Pub you see today. This building has always been a heartbeat of the community.
            <br />
            <br />
            Nestled in the heart of historic Downtown Paris, we are proud to share the core of our town with incredible local artists, one of a kind vendors, creative service providers, and a unique lineup of restaurants, each bringing their own flavour to the Paris experience.
          </p>

          <div className="hero-banner">
            <img src="/image-1.jpg" alt="Paris Pub" className="hero-img" />

            <div className="hero-cta-wrap">
              <Link to="/reserve" className="btn primary hero-cta btn-breathe">
                Reserve a Table
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu with photos and prices */}
      <section className="section">
        <div className="container">
          <h2>Menu</h2>

          <div className="grid menu-grid">
            {dishes.map(d => (
              <article className="card dish" key={d.id}>
                <img className="dish-img" src={d.img} alt={d.name} />
                <div className="dish-body">
                  <div className="dish-top">
                    <h3 className="dish-name">{d.name}</h3>
                    <span className="price">${d.price.toFixed(2)}</span>
                  </div>
                  <p className="dish-desc">{d.desc}</p>
                  <span className="dish-tag">{d.category}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery stays the same */}
      <section className="section">
        <div className="container">
          <h2>Gallery</h2>
          <div className="gallery">
            {gallery.map((src, i) => (
              <img className="img" key={i} src={src} alt="Restaurant" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
