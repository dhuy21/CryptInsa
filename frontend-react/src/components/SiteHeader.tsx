import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import type { Lang, MessageKey } from "../i18n/messages";

const LINKS: { to: string; label: MessageKey; icon: string; end: boolean }[] = [
  { to: "/", label: "nav.home", icon: "fas fa-chart-bar", end: true },
  { to: "/about_us", label: "nav.about", icon: "fas fa-info-circle", end: false },
  { to: "/help", label: "nav.help", icon: "fas fa-question-circle", end: false },
];

export default function SiteHeader() {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
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
            <h1 className="brand-title">
              <Link to="/" className="brand-logo-link">
                <img src="/images/logo_cryptinsa.png" alt="CryptInsa" className="cryptinsa-logo" />
              </Link>
            </h1>
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
                    <i className={link.icon} /> {t(link.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="nav-tools">
            <div className="lang-switch" role="group" aria-label={t("lang.switch")}>
              {(["fr", "en"] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                >
                  {t(code === "fr" ? "lang.fr" : "lang.en")}
                </button>
              ))}
            </div>
            <button
              className={`nav-toggle${menuOpen ? " active" : ""}`}
              id="navToggle"
              type="button"
              aria-label={t("nav.menu")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="toggle-line" />
              <span className="toggle-line" />
              <span className="toggle-line" />
            </button>
            <div className="insa-logo-container">
              <img src="/images/logo_insa.png" alt={t("nav.logo")} className="insa-logo" />
            </div>
          </div>
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
