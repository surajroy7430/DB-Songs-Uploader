import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { SongProvider } from "./context/SongContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <SongProvider>
        <App />
      </SongProvider>
    </AuthProvider>
  </Router>
);
