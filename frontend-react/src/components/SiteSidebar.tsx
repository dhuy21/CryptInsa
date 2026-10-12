import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function toolActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}_`);
}

export default function SiteSidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(() => toolActive(location.pathname, "/substitution") || location.pathname === "/cesar");

  useEffect(() => {
    setOpen(false);
    setToolsOpen(toolActive(location.pathname, "/substitution") || location.pathname === "/cesar");
  }, [location.pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className={`sidebar${open ? " active" : ""}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="fas fa-shield-alt" />
            <span className="sidebar-title">CryptInsa</span>
          </div>
          <button className="sidebar-close" id="sidebarClose" type="button" aria-label={t("side.close")} onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M6.2 5.2 5.2 6.2 10.9 12l-5.7 5.8 1 1L12 13.1l5.8 5.7 1-1L13.1 12l5.7-5.8-1-1L12 10.9 6.2 5.2z" />
            </svg>
          </button>
        </div>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              <li className="menu-item">
                <NavLink to="/" end className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-home" />
                  <span>{t("side.home")}</span>
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/about_us" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-users" />
                  <span>{t("side.team")}</span>
                </NavLink>
              </li>
              <li className={`menu-item has-submenu${toolsOpen ? " open" : ""}`}>
                <a href="#outils" className="menu-link submenu-toggle" onClick={(event) => {
                  event.preventDefault();
                  setToolsOpen((current) => !current);
                }}>
                  <i className="fas fa-tools" />
                  <span>{t("side.tools")}</span>
                  <i className="fas fa-chevron-down submenu-arrow" />
                </a>
                <ul className="submenu">
                  <li>
                    <NavLink to="/cesar" className={() => `submenu-link${location.pathname === "/cesar" ? " active" : ""}`}>
                      <i className="fas fa-key" />
                      {t("side.cesar")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/substitution" className={() => `submenu-link${toolActive(location.pathname, "/substitution") ? " active" : ""}`}>
                      <i className="fas fa-exchange-alt" />
                      {t("side.substitution")}
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="menu-item">
                <NavLink to="/help" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-question-circle" />
                  <span>{t("side.help")}</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className={`sidebar-overlay${open ? " active" : ""}`} id="sidebarOverlay" onClick={() => setOpen(false)} />
      <button
        className="sidebar-toggle"
        id="sidebarToggle"
        type="button"
        aria-expanded={open}
        aria-label={open ? t("side.close") : t("side.open")}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M6.2 5.2 5.2 6.2 10.9 12l-5.7 5.8 1 1L12 13.1l5.8 5.7 1-1L13.1 12l5.7-5.8-1-1L12 10.9 6.2 5.2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
          </svg>
        )}
      </button>
    </>
  );
}
