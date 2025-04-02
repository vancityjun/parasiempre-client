import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Admin from "./components/Admin";
import Login from "./components/Login";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
