import { useEffect, useMemo, useState } from "react";

export default function SiteFooter() {
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
              <h3>Projet d'application-Cryptanalyse</h3>
              <p>Analyse de fréquence avancée pour la recherche et l'éducation en cryptographie.</p>
            </div>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-tools" /> Tools</h4>
            <ul>
              <li><a href="#frequency">Analyse de fréquence</a></li>
              <li><a href="#cipher">Outils de chiffrement</a></li>
              <li><a href="#statistics">Statistiques</a></li>
              <li><a href="#patterns">Détection de motifs</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-book" /> Resources</h4>
            <ul>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#tutorials">Tutoriels</a></li>
              <li><a href="#examples">Exemples</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4><i className="fas fa-code" /> Developer</h4>
            <ul>
              <li><a href="https://github.com/TedBarbier/CryptInsa"><i className="fab fa-github" /> GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {year} Cryptanalyse. Deployées par <i className="fas fa-heart pulse" /> pour les amateurs de cryptographie.</p>
            <div className="security-badge">
              <i className="fas fa-lock" />
              <span>Secure & Open Source</span>
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
