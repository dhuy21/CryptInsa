import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function toolActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}_`);
}

export default function SiteSidebar() {
  const location = useLocation();
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
          <button className="sidebar-close" id="sidebarClose" type="button" aria-label="Fermer" onClick={() => setOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              <li className="menu-item">
                <NavLink to="/" end className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-home" />
                  <span>Accueil</span>
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/about_us" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-users" />
                  <span>Notre Équipe</span>
                </NavLink>
              </li>
              <li className={`menu-item has-submenu${toolsOpen ? " open" : ""}`}>
                <a href="#outils" className="menu-link submenu-toggle" onClick={(event) => {
                  event.preventDefault();
                  setToolsOpen((current) => !current);
                }}>
                  <i className="fas fa-tools" />
                  <span>Outils Crypto</span>
                  <i className="fas fa-chevron-down submenu-arrow" />
                </a>
                <ul className="submenu">
                  <li>
                    <NavLink to="/cesar" className={() => `submenu-link${location.pathname === "/cesar" ? " active" : ""}`}>
                      <i className="fas fa-key" />
                      Chiffre César
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/substitution" className={() => `submenu-link${toolActive(location.pathname, "/substitution") ? " active" : ""}`}>
                      <i className="fas fa-exchange-alt" />
                      Substitution
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="menu-item">
                <NavLink to="/help" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
                  <i className="fas fa-question-circle" />
                  <span>Aide</span>
                </NavLink>
              </li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            <div className="crypto-info">
              <div className="info-item">
                <i className="fas fa-shield-check" />
                <span>Sécurisé</span>
              </div>
              <div className="info-item">
                <i className="fas fa-graduation-cap" />
                <span>Éducatif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`sidebar-overlay${open ? " active" : ""}`} id="sidebarOverlay" onClick={() => setOpen(false)} />
      <button className="sidebar-toggle" id="sidebarToggle" type="button" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}>
        <i className="fas fa-bars" />
      </button>
    </>
  );
}
