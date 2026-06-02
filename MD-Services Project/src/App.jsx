import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import PestControl from "./pages/PestControl";
import Waterproofing from "./pages/Waterproofing";
import Housekeeping from "./pages/Housekeeping";
import BathroomCleaning from "./pages/BathroomCleaning";
import Admin from "./pages/Admin";

function AppContent() {
  const location = useLocation();
  // Hide Navbar & Footer on Admin pages
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pest-control" element={<PestControl />} />
          <Route path="/waterproofing" element={<Waterproofing />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/bathroom-cleaning" element={<BathroomCleaning />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}