import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./Home.jsx";
import Reserve from "./Reserve.jsx";
import AdminLogin from "./AdminLogin.jsx";
import Admin from "./Admin.jsx";

// App.jsx
export const API_URL = import.meta.env.VITE_API_URL || "https://rr-backend-98sd.onrender.com";

export default function App() {
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">Paris Pub</div>
        <div className="links">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/reserve" className={linkClass}>Reserve</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Admin />} />
      </Routes>

      <footer className="footer">
        <p>44 Grand River St N, Paris, ON N3L 2M2</p>
      </footer>
    </div>
  );
}
