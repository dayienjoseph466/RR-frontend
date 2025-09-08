// client/src/Vendors.jsx
import React from "react";

const vendors = [
  {
    name: "Link Street Sausage House",
    blurb:
      "Providing us with the freshest of steak, hamburger, cured meats and chicken, our local hometown butcher is a must stop when shopping in town.",
    img: "/link-street.jpg", // place file in public/vendors/
    href: "https://link-street-sausage-house.myshopify.com/",
  },
  {
    name: "Jiggs n Reels Seafood Market",
    blurb:
      "Located at the corner of Broadway and William, Jiggs n Reels is our local and super friendly fish monger. With fresh catch flown in daily from the East Coast, we highly recommend them for variety, quality and charm.",
    img: "/jiggs-reels.jpg",
    href: "https://www.jiggsnreels.ca/",
  },
  {
    name: "Van Laeken Family Farm",
    blurb:
      "Here at Paris Pub we want the freshest produce we can get our hands on, and the Van Laeken Family keeps us stocked week after week. With a huge variety of fruits, vegetables, herbs and more, they are a definite stop on your next visit to the Wincey Mills Co. in Downtown Paris.",
    img: "/van-laeken.jpg",
    href: "https://www.vlfamilyfarm.com/",
  },
];

export default function Vendors() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.1,
            letterSpacing: 0.3,
            margin: "24px 0 28px",
          }}
        >
          Local Vendors
        </h1>

        <div style={{ display: "grid", gap: 72 }}>
          {vendors.map((v, idx) => (
            <article
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "340px 1fr",
                gap: 28,
                alignItems: "start",
              }}
            >
              <div>
                <img
                  src={v.img}
                  alt={v.name}
                  style={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 10,
                  }}
                >
                  {v.name}
                </div>

                <p style={{ fontSize: 18, lineHeight: 1.7, color: "#374151" }}>
                  {v.blurb}
                </p>

                <a
                  href={v.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 18,
                    padding: "10px 18px",
                    background: "#1f2937",
                    color: "#fff",
                    borderRadius: 6,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  }}
                >
                  Learn more
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* simple mobile layout */}
      <style>{`
        @media (max-width: 900px) {
          .container h1 { font-size: 40px !important; }
          article { grid-template-columns: 1fr !important; }
          article img { height: 220px !important; }
        }
      `}</style>
    </section>
  );
}
