import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";
import "../styles/home.css";

export default function HomePage() {
  useEffect(() => {
    document.title = "CryptoAnalyzer - Analyse de Fréquence";
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <i className="fas fa-lock" /> CRYPTINSA
              <span className="subtitle">Cryptanalyse</span>
            </h1>
            <p className="hero-description">
              Découvrez les secrets cachés dans les textes chiffrés grâce à ce site.
              Un outil simple et puissant pour la cryptanalyse.
            </p>
            <div className="hero-actions">
              <Link to="/substitution" className="btn btn-primary btn-lg">
                <i className="fas fa-play" /> Commencer
              </Link>
              <Link to="/about_us" className="btn btn-secondary btn-lg">
                <i className="fas fa-info-circle" /> En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <h2 className="section-title">Qu'est-ce que la cryptanalyse ?</h2>
            <p className="intro-text">
              La cryptanalyse est l'ensemble des techniques utilisées pour déchiffrer un message chiffré sans connaître la clé de chiffrement.
              Cette méthode exploite le fait que certaines lettres apparaissent plus souvent que d'autres dans chaque langue.
              Cette méthode est utilisée pour déchiffrer les messages chiffrés par la méthode de substitution.
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
            <h2>Prêt à analyser votre premier message ?</h2>
            <Link to="/substitution" className="btn btn-primary btn-lg">
              <i className="fas fa-rocket" /> Commencer maintenant
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
