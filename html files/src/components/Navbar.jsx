import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.jpeg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavClick = (sectionId) => {
    closeMenu();
    if (sectionId === "home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Scroll to hash on page change (e.g. returning to homepage)
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo" onClick={() => window.scrollTo(0, 0)}>
          <img src={logo} alt="PestMD Logo" style={{ width: "50px", height: "50px" }} />
          <span>MD Services</span>
        </Link>
        
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li>
            <a style={{ cursor: "pointer" }} onClick={() => handleNavClick("home")}>Home</a>
          </li>
          <li>
            <a style={{ cursor: "pointer" }} onClick={() => handleNavClick("about")}>About</a>
          </li>
          <li>
            <a style={{ cursor: "pointer" }} onClick={() => handleNavClick("services")}>Services</a>
          </li>
          <li>
            <a style={{ cursor: "pointer" }} className="nav-btn" onClick={() => handleNavClick("contact")}>Contact Us</a>
          </li>
        </ul>
        
        <div className="hamburger" onClick={toggleMenu}>
          <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
        </div>
      </div>
    </nav>
  );
}
