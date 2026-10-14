import { useEffect } from "react";
import Button from "../components/Button";
import TeamSlideshow from "../components/TeamSlideshow";
import { useLanguage } from "../i18n/LanguageContext";
import { aboutText } from "../i18n/aboutText";
import "../styles/main.css";
import "../styles/about_us.css";

export default function AboutPage() {
  const { lang } = useLanguage();
  const text = aboutText[lang];

  useEffect(() => {
    document.title = text.pageTitle;
  }, [text.pageTitle]);

  return (
    <main className="about-page">
      <section className="hero-about">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <i className="fas fa-users" />
              {" "}{text.title}
              <span className="subtitle">{text.subtitle}</span>
            </h1>
            <p className="hero-description">
              {text.lead}
            </p>
          </div>
        </div>
      </section>

      <section className="project-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-project-diagram" /> {text.project}
            </h2>
            <p className="section-subtitle">{text.projectSubtitle}</p>
          </div>
          <div className="project-content">
            <div className="project-info">
              <div className="project-card main-card">
                <div className="card-icon">
                  <i className="fas fa-shield-alt" />
                </div>
                <h3>{text.mission}</h3>
                <p>
                  {text.missionText}
                </p>
              </div>
              <div className="project-features">
                {text.features.map((feature) => (
                  <div className="feature-card" key={feature.title}>
                    <div className="feature-icon">
                      <i className={`fas ${feature.icon}`} />
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section" id="slideshow">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-user-friends" /> {text.team}
            </h2>
            <p className="section-subtitle">{text.teamSubtitle}</p>
          </div>
          <div className="team-slideshow">
            <TeamSlideshow members={text.members} />
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-heart" /> {text.valuesTitle}
            </h2>
            <p className="section-subtitle">{text.valuesSubtitle}</p>
          </div>
          <div className="values-grid">
            {text.values.map((value) => (
              <div className="value-card" key={value.title}>
                <div className="value-icon">
                  <i className={`fas ${value.icon}`} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{text.ctaTitle}</h2>
            <p>{text.ctaText}</p>
            <div className="cta-buttons">
              <Button to="/substitution" size="lg">
                <i className="fas fa-play" /> {text.tryTools}
              </Button>
              <Button href="#slideshow" variant="secondary" size="lg">
                <i className="fas fa-envelope" /> {text.contact}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
