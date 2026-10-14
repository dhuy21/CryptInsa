import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { helpText } from "../i18n/helpText";
import "../styles/main.css";
import "../styles/help.css";

export default function HelpPage() {
  const { lang } = useLanguage();
  const text = helpText[lang];
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = text.pageTitle;
    function onScroll() {
      setShowTop(window.scrollY > 300);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [text.pageTitle]);

  return (
    <div className="help-container">
      <div className="help-header">
        <div className="help-hero">
          <h1><i className="fas fa-question-circle" /> {text.title}</h1>
          <p className="help-subtitle">{text.subtitle}</p>
        </div>
      </div>

      <div className="help-content">
        <section className="help-section" id="introduction">
          <h2><i className="fas fa-info-circle" /> {text.introTitle}</h2>
          <div className="help-card">
            <p>{text.intro}</p>
            <h4>{text.learnTitle}</h4>
            <ul>
              {text.learn.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="help-section" id="caesar">
          <h2><i className="fas fa-shield-alt" /> {text.caesarTitle}</h2>
          <div className="help-card">
            <h4>{text.principle}</h4>
            <p>{text.caesarPrinciple}</p>
            <div className="example-box">
              <h5>{text.exampleTitle}</h5>
              <div className="cipher-example">
                <div className="text-line">
                  <span className="label">{text.originalLabel}</span>
                  <span className="text">HELLO WORLD</span>
                </div>
                <div className="text-line">
                  <span className="label">{text.cipherLabel}</span>
                  <span className="text">KHOOR ZRUOG</span>
                </div>
              </div>
            </div>
            <h4>{text.howTo}</h4>
            <ol>
              {text.caesarSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
        </section>

        <section className="help-section" id="substitution">
          <h2><i className="fas fa-exchange-alt" /> {text.substitutionTitle}</h2>
          <div className="help-card">
            <h4>{text.principle}</h4>
            <p>{text.substitutionPrinciple}</p>
            <h4>{text.howTo}</h4>
            <ol>
              {text.substitutionSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="tip-box">
              <i className="fas fa-lightbulb" />
              <strong>{text.tipLabel}</strong> {text.tip}
            </div>
          </div>
        </section>

        <section className="help-section" id="attack">
          <h2><i className="fas fa-search" /> {text.attackTitle}</h2>
          <div className="help-card">
            <h4>{text.principle}</h4>
            <p>{text.attackPrinciple}</p>
            <h4>{text.howTo}</h4>
            <ol>
              {text.attackHow.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="process-steps">
              <h5>{text.attackProcess}</h5>
              {text.attackSteps.map((step, stepIndex) => (
                <div className="step" key={step}>
                  <span className="step-number">{stepIndex + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="help-section" id="glossary">
          <h2><i className="fas fa-book" /> {text.glossaryTitle}</h2>
          <div className="help-card">
            <div className="glossary-grid">
              {text.glossary.map((entry) => (
                <div className="term" key={entry.term}>
                  <h4>{entry.term}</h4>
                  <p>{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <button
        className={showTop ? "back-to-top is-shown" : "back-to-top"}
        type="button"
        aria-label={text.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <i className="fas fa-arrow-up" />
      </button>
    </div>
  );
}
