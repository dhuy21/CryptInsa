import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
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
              <Link to="/" className="hero-logo-link">
                <img src="/images/logo_cryptinsa.png" alt="CryptInsa" className="hero-logo" />
              </Link>
              <span className="subtitle">{t("home.subtitle")}</span>
            </h1>
            <p className="hero-description">
              {t("home.lead")}
            </p>
            <div className="hero-actions">
              <Button to="/substitution" size="lg">
                <i className="fas fa-play" /> {t("home.start")}
              </Button>
              <Button to="/about_us" variant="secondary" size="lg">
                <i className="fas fa-info-circle" /> {t("home.more")}
              </Button>
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
                <div className="cipher-arrow" aria-hidden="true">→</div>
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
            <Button to="/substitution" size="lg">
              <i className="fas fa-rocket" /> {t("home.startNow")}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
