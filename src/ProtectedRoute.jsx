// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "./App.jsx";

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { setOk(false); return; }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) return null;
  if (!ok) return <Navigate to="/parispublogin" replace />;
  return children;
}
