import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/main.css";
import "../styles/home.css";

export default function HomePage() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    document.title = t("home.title");
  }, [lang, t]);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <i className="fas fa-lock" /> CRYPTINSA
              <span className="subtitle">{t("home.subtitle")}</span>
            </h1>
            <p className="hero-description">
              {t("home.lead")}
            </p>
            <div className="hero-actions">
              <Link to="/substitution" className="btn btn-primary btn-lg">
                <i className="fas fa-play" /> {t("home.start")}
              </Link>
              <Link to="/about_us" className="btn btn-secondary btn-lg">
                <i className="fas fa-info-circle" /> {t("home.more")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <h2 className="section-title">{t("home.what")}</h2>
            <p className="intro-text">
              {t("home.explain")}
            </p>
            <div className="example-box">
              <div className="cipher-example">
                <div className="cipher-text">KHOOR ZRUOG</div>
                <div className="cipher-arrow">↓</div>
                <div className="plain-text">HELLO WORLD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t("home.ready")}</h2>
            <Link to="/substitution" className="btn btn-primary btn-lg">
              <i className="fas fa-rocket" /> {t("home.startNow")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
