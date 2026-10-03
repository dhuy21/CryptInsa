import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAttack } from "../api/attack";
import "../styles/main.css";
import "../styles/substitution_attaque.css";

export default function SubstitutionAttackPage() {
  const navigate = useNavigate();
  const [text, setText] = useState(() => localStorage.getItem("ciphertext") ?? "");
  const [launching, setLaunching] = useState(false);
  const [notice, setNotice] = useState("");
  const launchTimer = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    document.title = "Attaque par substitution";
    return () => {
      mountedRef.current = false;
      if (launchTimer.current !== null) {
        window.clearTimeout(launchTimer.current);
      }
    };
  }, []);

  const upper = text.toUpperCase();
  const letters = upper.match(/[A-Z]/g) ?? [];
  const uniqueLetters = new Set(letters).size;
  const longEnough = text.trim().length >= 50;

  function rememberText(value: string) {
    const stored = value.toUpperCase();
    if (stored.trim()) {
      localStorage.setItem("cipherText", stored);
    } else {
      localStorage.removeItem("cipherText");
    }
  }

  async function launch() {
    const currentText = text.trim();
    if (!currentText) {
      setNotice("Aucun texte à analyser");
      return;
    }
    if (currentText.length < 50) {
      setNotice("Texte trop court pour une analyse fiable");
      return;
    }
    const cipherText = currentText.toUpperCase();
    setLaunching(true);
    setNotice("Redirection vers l'analyse de fréquences...");
    if (launchTimer.current !== null) {
      window.clearTimeout(launchTimer.current);
    }
    launchTimer.current = window.setTimeout(async () => {
      try {
        const started = await startAttack(cipherText);
        if (!mountedRef.current) {
          return;
        }
        const attackData = {
          cipherText,
          language: "french",
          timestamp: Date.now(),
          attackId: started.attackId,
        };
        localStorage.setItem("attackData", JSON.stringify(attackData));
        localStorage.setItem("cipherText", cipherText);
        navigate("/substitution_annalyse");
      } catch {
        if (!mountedRef.current) {
          return;
        }
        setNotice("Erreur lors du lancement");
        setLaunching(false);
      }
    }, 1000);
  }

  return (
    <div className="attack-page substitution-container">
      <section className="tool-section">
        <div className="container">
          <h2 className="section-title"><i className="fas fa-crosshairs" /> Attaque par Substitution</h2>
          <div className="main-grid">
            <div className="input-section">
              <div className="main-input-area">
                <div className="textarea-container">
                  <label className="input-label" htmlFor="inputText">Texte Chiffré</label>
                  <textarea
                    id="inputText"
                    rows={8}
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      rememberText(event.target.value);
                    }}
                  />
                </div>
                <div className="input-stats">
                  <div className="stats-item">
                    <i className="fas fa-sort-numeric-up" />
                    <span>Caractères: <strong>{upper.length}</strong></span>
                  </div>
                  <div className="stats-item">
                    <i className="fas fa-font" />
                    <span>Lettres: <strong>{letters.length}</strong></span>
                  </div>
                  <div className="stats-item">
                    <i className="fas fa-percentage" />
                    <span>Uniques: <strong>{uniqueLetters}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="attack-section">
              <div className="attack-launch">
                <button
                  id="launchAttack"
                  className="btn-attack"
                  type="button"
                  disabled={!longEnough || launching}
                  onClick={launch}
                >
                  <div className="attack-icon">
                    <i className={launching ? "fas fa-spinner fa-spin" : "fas fa-rocket"} />
                  </div>
                  <div className="attack-text">
                    <span className="attack-title">
                      {launching ? "LANCEMENT..." : longEnough ? "LANCER L'ATTAQUE" : "TEXTE TROP COURT"}
                    </span>
                    <span className="attack-subtitle">
                      {launching ? "Redirection en cours" : longEnough ? "Analyse de Fréquences" : "Min. 50 caractères requis"}
                    </span>
                  </div>
                </button>
                {notice ? <p className="attack-subtitle">{notice}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
