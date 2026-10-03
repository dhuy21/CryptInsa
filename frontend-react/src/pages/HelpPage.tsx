import { useEffect, useState } from "react";
import "../styles/main.css";
import "../styles/help.css";

const attackSteps = [
  "Analyse des fréquences des lettres",
  "Identification des motifs répétitifs",
  "Correspondance avec le français",
  "Proposition de déchiffrement",
];

const glossary = [
  ["Chiffrement", "Processus de transformation d'un texte lisible en texte secret."],
  ["Déchiffrement", "Processus inverse qui retrouve le texte original à partir du texte chiffré."],
  ["Clé", "Information secrète nécessaire pour chiffrer ou déchiffrer un message."],
  ["Cryptanalyse", "Science qui étudie les méthodes pour casser les chiffrements."],
  ["Substitution", "Remplacement de chaque lettre par une autre selon une règle définie."],
  ["Fréquence", "Nombre d'occurrences d'une lettre dans un texte, exprimé en pourcentage."],
] as const;

export default function HelpPage() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = "Aide - CryptInsa";
    function onScroll() {
      setShowTop(window.scrollY > 300);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="help-container">
      <div className="help-header">
        <div className="help-hero">
          <h1><i className="fas fa-question-circle" /> Guide d'utilisation - CryptInsa</h1>
          <p className="help-subtitle">Apprenez la cryptographie par substitution et son analyse step-by-step</p>
        </div>
      </div>

      <div className="help-content">
        <section className="help-section" id="introduction">
          <h2><i className="fas fa-info-circle" /> Introduction à CryptInsa</h2>
          <div className="help-card">
            <p><strong>CryptInsa</strong> est une application pédagogique interactive qui vous permet de découvrir les principes de la cryptographie par substitution et de comprendre comment ces chiffrements peuvent être attaqués.</p>
            <h4>Que pouvez-vous apprendre ?</h4>
            <ul>
              <li>Le fonctionnement des chiffrements César</li>
              <li>Comment créer vos propres chiffrements par substitution</li>
              <li>Les techniques d'analyse de fréquences</li>
              <li>Comment casser un chiffrement par substitution</li>
            </ul>
          </div>
        </section>

        <section className="help-section" id="caesar">
          <h2><i className="fas fa-shield-alt" /> Chiffrement de César</h2>
          <div className="help-card">
            <h4>Principe</h4>
            <p>Le chiffrement de César est l'un des plus anciens chiffrements connus. Il consiste à décaler chaque lettre de l'alphabet d'un nombre fixe de positions.</p>
            <div className="example-box">
              <h5>Exemple avec un décalage de 3 :</h5>
              <div className="cipher-example">
                <div className="text-line">
                  <span className="label">Texte original :</span>
                  <span className="text">HELLO WORLD</span>
                </div>
                <div className="text-line">
                  <span className="label">Texte chiffré :</span>
                  <span className="text">KHOOR ZRUOG</span>
                </div>
              </div>
            </div>
            <h4>Comment utiliser :</h4>
            <ol>
              <li>Rendez-vous sur la page <strong>César</strong></li>
              <li>Entrez votre texte dans la zone de saisie</li>
              <li>Choisissez la valeur de décalage (1-25)</li>
              <li>Cliquez sur <strong>"Chiffrer"</strong> ou <strong>"Déchiffrer"</strong></li>
              <li>Observez la transformation étape par étape</li>
            </ol>
          </div>
        </section>

        <section className="help-section" id="substitution">
          <h2><i className="fas fa-exchange-alt" /> Chiffrement par substitution</h2>
          <div className="help-card">
            <h4>Principe</h4>
            <p>Ce chiffrement remplace chaque lettre de l'alphabet par une autre lettre selon une table de substitution personnalisée.</p>
            <h4>Comment utiliser :</h4>
            <ol>
              <li>Visitez la page <strong>Substitution</strong></li>
              <li>Entrez votre texte à chiffrer</li>
              <li>Définissez votre alphabet de substitution ou utilisez celui généré</li>
              <li>Observez le résultat du chiffrement</li>
              <li>Sauvegardez le texte chiffré pour l'analyse</li>
            </ol>
            <div className="tip-box">
              <i className="fas fa-lightbulb" />
              <strong>Conseil :</strong> Utilisez des textes suffisamment longs (50+ caractères) pour une analyse de fréquences efficace.
            </div>
          </div>
        </section>

        <section className="help-section" id="attack">
          <h2><i className="fas fa-search" /> Attaque par substitution</h2>
          <div className="help-card">
            <h4>Principe</h4>
            <p>Cette fonctionnalité vous permet de "casser" un chiffrement par substitution en utilisant l'analyse de fréquences et la reconnaissance de motifs.</p>
            <h4>Comment utiliser :</h4>
            <ol>
              <li>Allez sur la page <strong>Attaque par substitution</strong></li>
              <li>Collez un texte chiffré par substitution</li>
              <li>Lancez l'attaque automatique</li>
              <li>Observez les étapes de déchiffrement</li>
              <li>Analysez les correspondances proposées</li>
              <li>Ajustez manuellement si nécessaire</li>
            </ol>
            <div className="process-steps">
              <h5>Étapes de l'attaque :</h5>
              {attackSteps.map((step, stepIndex) => (
                <div className="step" key={step}>
                  <span className="step-number">{stepIndex + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="help-section" id="glossary">
          <h2><i className="fas fa-book" /> Glossaire</h2>
          <div className="help-card">
            <div className="glossary-grid">
              {glossary.map(([term, text]) => (
                <div className="term" key={term}>
                  <h4>{term}</h4>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <button
        className={showTop ? "back-to-top visible" : "back-to-top"}
        type="button"
        aria-label="Retour en haut"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <i className="fas fa-arrow-up" />
      </button>
    </div>
  );
}
