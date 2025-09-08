import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./Home.jsx";
import Reserve from "./Reserve.jsx";

/* renamed admin pages (match your files) */
import AdminLogin from "./parispublogin.jsx";
import Admin from "./admindashboard.jsx";

/* category pages */
import MenuAppetizers from "./MenuAppetizers.jsx";
import MenuMains from "./MenuMains.jsx";
import MenuDesserts from "./MenuDesserts.jsx";
import MenuBeverages from "./MenuBeverages.jsx";

/* protect admin dashboard */
import ProtectedRoute from "./ProtectedRoute.jsx";
import Events from "./Events.jsx";
import AdminMenuEditor from "./assets/AdminMenuEditor.jsx";
import AdminEventsEditor from "./assets/AdminEventsEditor.jsx";

/* contact page */
import Contact from "./Contact.jsx";

/* NEW page */
import Vendors from "./Vendors.jsx"; // <— add your new page file

// App.jsx
export const API_URL =
  import.meta.env.VITE_API_URL || "https://rr-backend-98sd.onrender.com";

export default function App() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">Paris Pub</div>
        <div className="links">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/reserve" className={linkClass}>Reserve</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/vendors" className={linkClass}>Vendors</NavLink> {/* NEW */}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserve" element={<Reserve />} />

        {/* contact page */}
        <Route path="/contact" element={<Contact />} />

        {/* events page */}
        <Route path="/events" element={<Events />} />

        {/* inside <Routes> */}
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute>
              <AdminMenuEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <AdminEventsEditor />
            </ProtectedRoute>
          }
        />

        {/* admin routes with new paths */}
        <Route path="/parispublogin" element={<AdminLogin />} />
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* category pages */}
        <Route path="/menu/appetizers" element={<MenuAppetizers />} />
        <Route path="/menu/mains" element={<MenuMains />} />
        <Route path="/menu/desserts" element={<MenuDesserts />} />
        <Route path="/menu/beverages" element={<MenuBeverages />} />

        {/* NEW route */}
        <Route path="/vendors" element={<Vendors />} />
      </Routes>

      <footer className="footer">
        <p>44 Grand River St N, Paris, ON N3L 2M2</p>
      </footer>
    </div>
  );
}
