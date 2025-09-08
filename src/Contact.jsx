import React from "react";

export default function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-container" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        
        {/* Left side: Contact details */}
        <div className="contact-details" style={{ flex: "1 1 300px" }}>
          <h2>Contact Us</h2>
          <p><strong>Paris Pub</strong></p>
          <p>44 Grand River Street North</p>
          <p>Paris, Ontario N3L 2H2</p>
          <p>Canada</p>

          <p><strong>Phone:</strong> +1 (519) 442-6110</p>
          <p><strong>Email:</strong> hello@parispub.ca</p>

          <div className="social-links" style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={() => window.open("https://www.instagram.com/theotherparispub/", "_blank")}
            >
              Instagram
            </button>
            <button
              onClick={() => window.open("https://www.facebook.com/theparispub", "_blank")}
            >
              Facebook
            </button>
            <button
              onClick={() => (window.location.href = "mailto:hello@parispub.ca")}
            >
              Send Email
            </button>
          </div>
        </div>

        {/* Right side: Embedded Google Map */}
        <div className="contact-map" style={{ flex: "1 1 300px" }}>
          <iframe
            title="Paris Pub Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2887.147258594757!2d-80.386642!3d43.1929546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882c6c34eb696061%3A0x495bae38c1476aaf!2s44%20Grand%20River%20St%20N%2C%20Paris%2C%20ON%20N3L%202M2%2C%20Canada!5e0!3m2!1sen!2sca!4v1693429189123!5m2!1sen!2sca"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
