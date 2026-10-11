import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Accueil", icon: "fas fa-chart-bar", end: true },
  { to: "/about_us", label: "A propos de nous", icon: "fas fa-info-circle", end: false },
  { to: "/help", label: "Aide", icon: "fas fa-question-circle", end: false },
];

export default function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const binary = document.querySelector(".binary-stream");
    if (!binary) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      binary.querySelectorAll("span").forEach((span) => {
        span.textContent = Math.random().toString(2).slice(2, 10).padStart(8, "0");
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function onScroll() {
      const header = document.querySelector<HTMLElement>(".crypto-header");
      if (!header) {
        return;
      }
      if (window.scrollY > 50) {
        header.style.backdropFilter = "blur(15px)";
        header.style.background = "linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 26, 46, 0.95) 50%, rgba(22, 33, 62, 0.95) 100%)";
      } else {
        header.style.backdropFilter = "blur(10px)";
        header.style.background = "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)";
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="crypto-header">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-logos">
              <i className="fas fa-lock crypto-icon" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">CryptInsa</h1>
              <span className="brand-subtitle">Cryptanalyse</span>
            </div>
          </div>
          <div className={`nav-menu${menuOpen ? " active" : ""}`} id="navMenu">
            <ul className="nav-links">
              {LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    onClick={() => {
                      if (window.innerWidth <= 768) {
                        setMenuOpen(false);
                      }
                    }}
                  >
                    <i className={link.icon} /> {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="insa-logo-container">
            <img src="/images/logo_insa.png" alt="Logo INSA" className="insa-logo" />
          </div>
          <button
            className={`nav-toggle${menuOpen ? " active" : ""}`}
            id="navToggle"
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="toggle-line" />
            <span className="toggle-line" />
            <span className="toggle-line" />
          </button>
        </div>
        <div className="header-decoration">
          <div className="binary-stream">
            <span>01001000</span>
            <span>01100101</span>
            <span>01101100</span>
            <span>01101100</span>
            <span>01101111</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
