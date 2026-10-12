import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const particles = useMemo(() => Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 4,
  })), []);
  const [hex, setHex] = useState(["0x41", "0x42", "0x43", "0x44"]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHex(Array.from({ length: 4 }, () => `0x${Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, "0")}`));
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="crypto-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-section">
            <div className="footer-brand">
              <i className="fas fa-shield-alt footer-icon" />
              <h3>{t("footer.title")}</h3>
              <p>{t("footer.lead")}</p>
            </div>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-tools" /> {t("footer.tools")}</h4>
            <ul>
              <li><Link to="/cesar">{t("footer.cesar")}</Link></li>
              <li><Link to="/substitution">{t("footer.substitution")}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-book" /> {t("footer.resources")}</h4>
            <ul>
              <li><Link to="/help">{t("footer.help")}</Link></li>
              <li><Link to="/about_us">{t("footer.about")}</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-code" /> {t("footer.developer")}</h4>
            <ul>
              <li><a href="https://github.com/dhuy21/CryptInsa"><i className="fab fa-github" /> GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {year} {t("footer.brand")} {t("footer.deployed")} <i className="fas fa-heart pulse" /> {t("footer.audience")}</p>
            <div className="security-badge">
              <i className="fas fa-lock" />
              <span>{t("footer.secure")}</span>
            </div>
            <i className="fas fa-shield-alt footer-icon" />
          </div>
          <div className="crypto-decoration">
            <div className="hex-pattern">
              {hex.map((value, index) => <span key={index}>{value}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="particles-container" id="particles">
        {particles.map((particle) => (
          <div
            className="particle"
            key={particle.id}
            style={{
              position: "absolute",
              width: 2,
              height: 2,
              background: "#00ff88",
              borderRadius: "50%",
              opacity: 0.3,
              animation: `particle-float ${particle.duration}s infinite ease-in-out`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </footer>
  );
}
