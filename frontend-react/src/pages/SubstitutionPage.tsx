import { useMemo, useState, useEffect } from "react";
import {
  EXAMPLE_TEXTS,
  SUBSTITUTION_ALPHABET,
  atbashMapping,
  encryptWithMapping,
  identityMapping,
  normalizeSubstitution,
  randomMapping,
  reverseMapping,
  type SubstitutionMap,
} from "../substitution";
import "../styles/main.css";
import "../styles/substitution.css";

const LETTERS = SUBSTITUTION_ALPHABET.split("");

function mappingIsComplete(mapping: SubstitutionMap): boolean {
  return LETTERS.every((letter) => mapping[letter]);
}

export default function SubstitutionPage() {
  const [mapping, setMapping] = useState<SubstitutionMap>(randomMapping);
  const [input, setInput] = useState("");

  useEffect(() => {
    document.title = "Illustration du chiffrement par substitution";
  }, []);

  const normalized = normalizeSubstitution(input);
  const output = useMemo(() => {
    if (!mappingIsComplete(mapping)) {
      return "";
    }
    return encryptWithMapping(normalized, mapping);
  }, [mapping, normalized]);

  function setLetter(letter: string, raw: string) {
    const value = raw.toUpperCase();
    if (value && !/^[A-Z ,.]$/.test(value)) {
      return;
    }
    if (value && Object.values(mapping).includes(value) && mapping[letter] !== value) {
      return;
    }
    setMapping((current) => ({ ...current, [letter]: value }));
  }

  function attack() {
    if (normalized.length === 0) {
      window.alert("Veuillez entrer un texte à déchiffrer");
      return;
    }
    localStorage.setItem("plaintext", normalized);
    localStorage.setItem("ciphertext", output);
    window.location.href = "/substitution_attaque";
  }

  return (
    <div className="substitution-page substitution-container">
      <section className="tool-section">
        <div className="container">
          <h2 className="section-title">Chiffrement par Substitution</h2>
          <div className="main-grid">
            <div className="substitution-section">
              <div className="section-header">
                <h3>Table de Substitution</h3>
                <div className="table-controls">
                  <button type="button" className="btn btn-generate" onClick={() => setMapping(randomMapping())}>
                    <i className="fas fa-dice" /> Aléatoire
                  </button>
                  <button type="button" className="key-btn compact" onClick={() => setMapping(identityMapping())}>
                    <i className="fas fa-equals" /> Identité
                  </button>
                  <button type="button" className="key-btn compact" onClick={() => setMapping(reverseMapping())}>
                    <i className="fas fa-exchange-alt" /> Inversé
                  </button>
                  <button type="button" className="key-btn compact" onClick={() => setMapping(atbashMapping())}>
                    <i className="fas fa-mirror" /> Atbash
                  </button>
                </div>
              </div>
              <div className="table-content">
                <div className="horizontal-table">
                  <div className="table-row original-row">
                    <div className="row-label">Original :</div>
                    <div className="letters-container">
                      {LETTERS.map((letter) => (
                        <div className="original-letter" key={letter}>{letter}</div>
                      ))}
                    </div>
                  </div>
                  <div className="table-row arrows-row">
                    <div className="row-label" />
                    <div className="arrows-container">
                      {LETTERS.map((letter) => (
                        <div className="mapping-arrow" key={letter}>↓</div>
                      ))}
                    </div>
                  </div>
                  <div className="table-row substitution-row">
                    <div className="row-label">Substitué :</div>
                    <div className="inputs-container">
                      {LETTERS.map((letter) => (
                        <input
                          key={letter}
                          className="substitution-input"
                          maxLength={1}
                          value={mapping[letter] ?? ""}
                          aria-label={letter}
                          onChange={(event) => setLetter(letter, event.target.value)}
                          onFocus={(event) => event.currentTarget.select()}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cipher-section">
              <div className="cipher-content">
                <div className="text-input-area">
                  <h3>Texte à chiffrer</h3>
                  <textarea
                    rows={5}
                    placeholder="Entrez votre texte..."
                    value={normalized}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  <div className="input-actions">
                    <button type="button" className="btn btn-secondary compact" onClick={() => setInput("")}>
                      <i className="fas fa-eraser" /> Effacer
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary compact"
                      onClick={() => {
                        navigator.clipboard.readText().then(setInput).catch(() => undefined);
                      }}
                    >
                      <i className="fas fa-paste" /> Coller
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary compact"
                      onClick={() => setInput(EXAMPLE_TEXTS[Math.floor(Math.random() * EXAMPLE_TEXTS.length)])}
                    >
                      <i className="fas fa-file-alt" /> Exemple
                    </button>
                  </div>
                </div>
                <div className="transform-area">
                  <div className="transform-indicator">
                    <i className="fas fa-arrow-right transform-arrow" />
                    <span className="transform-label">Chiffrement</span>
                  </div>
                  <button type="button" className="btn btn-attack compact" title="minimum 50 caractères" onClick={attack}>
                    <i className="fas fa-skull" /> Déchiffrer par attaque
                  </button>
                </div>
                <div className="text-output-area">
                  <h3>Texte chiffré</h3>
                  <textarea rows={5} readOnly value={output} />
                  <div className="output-actions">
                    <button
                      type="button"
                      className="btn btn-success compact"
                      onClick={() => {
                        if (output) {
                          navigator.clipboard.writeText(output).catch(() => undefined);
                        }
                      }}
                    >
                      <i className="fas fa-clipboard" /> Copier
                    </button>
                    <div className="stats">
                      <span>{normalized.length}</span> caractères → <span>{output.length}</span> caractères
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
