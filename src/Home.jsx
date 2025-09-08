import React from "react";
import { Link } from "react-router-dom";

/* four top level categories for the home page */
const categories = [
  {
    key: "appetizers",
    title: "Appetizers",
    desc: "Tap to see all starters",
    img: "/AP-RR1.jpg",
  },
  {
    key: "mains",
    title: "Mains",
    desc: "Tap to see all main dishes",
    img: "/MN-RR.jpeg",
  },
  {
    key: "beverages",
    title: "Beverages",
    desc: "Tap to see all drinks",
    img: "/iced-tea.webp",
  },
  {
    key: "desserts",
    title: "Desserts",
    desc: "Tap to see all sweets",
    img: "/cheesecake.jpeg",
  },
];

/* gallery images stay as you had them */
const gallery = [
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
  "/image-1.jpg",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200",
  "/restaurant1.jpg",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
];

/* single events teaser card */
const eventsTeaser = {
  title: "Upcoming Events",
  desc:
    "Live music nights, trivia, and special gatherings. Tap to see the full schedule.",
  img: "/event.jpeg", // place an image in public or change the path
};

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <h1>Welcome to Paris Pub</h1>
          <p>
            
Located at 44 Grand River Street North, the Paris Pub has lived many lives. From its early days as Scott’s Pharmacy to a beloved family-run sandwich shop, a gritty watering hole known by locals as Café Europa, and now, the vibrant and welcoming Paris Pub you see today—this building has always been a heartbeat of the community.

Nestled in the heart of historic Downtown Paris, we’re proud to share the core of our town with incredible local artists, one-of-a-kind vendors, creative service providers, and a truly unique lineup of restaurants, each bringing their own flavour to the Paris experience.

With a brand-new back patio, live music every Friday and Saturday night, and a menu designed to offer something for everyone, we’re excited to welcome both familiar faces and first-time visitors alike.

Come by and see what makes the Paris Pub more than just a pub,it's a place to gather, connect, and celebrate all things local.
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

      {/* Four clickable sections */}
      <section className="section">
        <div className="container">
          <h2>Explore the Menu</h2>

          <div className="grid cat-grid">
            {categories.map((c) => (
              <Link
                key={c.key}
                to={`/menu/${c.key}`}
                className="card cat"
                aria-label={`Go to ${c.title}`}
              >
                <img className="cat-img" src={c.img} alt={c.title} />
                <div className="cat-body">
                  <h3 className="cat-title">{c.title}</h3>
                  <p className="cat-desc">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Events teaser */}
      <section className="section">
        <div className="container">
          <h2>Events</h2>

          <Link to="/events" className="card event" aria-label="Go to events">
            <img
              className="event-img"
              src={eventsTeaser.img}
              alt="Upcoming events at Paris Pub"
            />
            <div className="event-body">
              <h3 className="event-title">{eventsTeaser.title}</h3>
              <p className="event-desc">{eventsTeaser.desc}</p>
              <span className="btn secondary">View Events</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Gallery */}
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
