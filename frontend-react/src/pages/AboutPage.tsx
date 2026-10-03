import { useEffect } from "react";
import TeamSlideshow from "../components/TeamSlideshow";
import { features, members, values } from "../aboutContent";
import "../styles/main.css";
import "../styles/about_us.css";

export default function AboutPage() {
  useEffect(() => {
    document.title = "À propos de nous";
  }, []);

  return (
    <main>
      <section className="hero-about">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <i className="fas fa-users" />
              {" "}À propos de nous
              <span className="subtitle">Équipe CryptInsa</span>
            </h1>
            <p className="hero-description">
              Découvrez notre équipe passionnée de cryptographie et l'histoire derrière CryptInsa,
              votre plateforme d'analyse cryptographique avancée.
            </p>
          </div>
        </div>
      </section>

      <section className="project-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-project-diagram" /> Notre Projet
            </h2>
            <p className="section-subtitle">CryptInsa : Votre allié en cryptanalyse</p>
          </div>
          <div className="project-content">
            <div className="project-info">
              <div className="project-card main-card">
                <div className="card-icon">
                  <i className="fas fa-shield-alt" />
                </div>
                <h3>Mission</h3>
                <p>
                  CryptInsa est né de notre passion commune pour la cryptographie et la sécurité informatique.
                  Nous avons créé cette plateforme pour démocratiser l'accès aux outils de cryptanalyse et
                  permettre à chacun de comprendre les mécanismes de chiffrement.
                </p>
              </div>
              <div className="project-features">
                {features.map((feature) => (
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
              <i className="fas fa-user-friends" /> Notre Équipe
            </h2>
            <p className="section-subtitle">Les esprits brillants derrière CryptInsa</p>
          </div>
          <div className="team-slideshow">
            <TeamSlideshow members={members} />
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-heart" /> Nos Valeurs
            </h2>
            <p className="section-subtitle">Ce qui nous guide au quotidien</p>
          </div>
          <div className="values-grid">
            {values.map((value) => (
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
            <h2>Rejoignez notre aventure cryptographique</h2>
            <p>Découvrez nos outils et participez à la communauté CryptInsa</p>
            <div className="cta-buttons">
              <a href="http://127.0.0.1:8000/test" className="btn btn-primary btn-lg">
                <i className="fas fa-play" /> Essayer nos outils
              </a>
              <a href="#slideshow" className="btn btn-secondary btn-lg">
                <i className="fas fa-envelope" /> Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
