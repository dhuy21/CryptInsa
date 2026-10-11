import { useEffect, useRef, useState } from "react";
import { readStoredAttackId, updateAttack, type AttackStep } from "../api/attack";
import { readStoredCipher } from "../substitutionAnalyse";
import {
  attackIsFinal,
  compareTexts,
  decryptText,
  DECRYPT_ALPHABET,
  displayedText,
  readStoredPlain,
  type ComparedChar,
} from "../substitutionDecrypt";
import "../styles/main.css";
import "../styles/substitution_dechiffre.css";

const POLL_MS = 3000;
const POLL_LIMIT = 20;
const PARTICLES = Array.from({ length: 20 }, (_, index) => index);

type NoticeType = "success" | "error" | "info";

type Notice = {
  id: number;
  message: string;
  type: NoticeType;
  shown: boolean;
};

type Mapping = Record<string, string | null>;

function wordValue(value: string | null): string {
  return value == null ? "null" : value;
}

export default function SubstitutionDecryptPage() {
  const [playing, setPlaying] = useState(false);
  const [energy, setEnergy] = useState(false);
  const [cipher, setCipher] = useState("");
  const [plain, setPlain] = useState("");
  const [motChiffre, setMotChiffre] = useState("");
  const [motTraduit, setMotTraduit] = useState("");
  const [mapping, setMapping] = useState<Mapping>({});
  const [compared, setCompared] = useState<ComparedChar[] | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  const stepsRef = useRef<AttackStep[]>([]);
  const indexRef = useRef(0);
  const mappingRef = useRef<Mapping>({});
  const plainRef = useRef("");
  const finishedRef = useRef(false);
  const pollCountRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const refreshGen = useRef(0);
  const attackIdRef = useRef("");
  const noticeSeq = useRef(0);
  const mountedRef = useRef(true);
  const notifyRef = useRef<(message: string, type: NoticeType) => void>(() => {});
  const finishRef = useRef<() => void>(() => {});
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  function notify(message: string, type: NoticeType) {
    if (!mountedRef.current) {
      return;
    }
    noticeSeq.current += 1;
    const id = noticeSeq.current;
    setNotices((current) => [...current, { id, message, type, shown: false }]);
    window.setTimeout(() => {
      setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, shown: true } : notice));
    }, 100);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 5300);
  }

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function finish() {
    finishedRef.current = true;
    stopTimer();
    if (!mountedRef.current) {
      return;
    }
    setPlaying(false);
    setEnergy(false);
  }

  function showDecryption() {
    if (!mountedRef.current) {
      return;
    }
    const cipherText = localStorage.getItem("cipherText") || "";
    const index = indexRef.current;
    const steps = stepsRef.current;
    const currentMapping = mappingRef.current;
    const decrypted = decryptText(cipherText, currentMapping);
    let chars: ComparedChar[];
    if (index > 0 && index < steps.length) {
      const previous = steps[index - 1]?.dictionnaire ?? {};
      chars = compareTexts(decrypted, decryptText(cipherText, previous));
    } else if (index === 0) {
      chars = compareTexts(decrypted, cipherText);
    } else {
      chars = compareTexts(decrypted, plainRef.current);
    }
    setMapping({ ...currentMapping });
    setCompared(chars);
    notify("Déchiffrement appliqué", "success");
  }

  function showCurrentStep() {
    const steps = stepsRef.current;
    if (steps.length === 0) {
      return;
    }
    if (indexRef.current < 0 || indexRef.current >= steps.length) {
      indexRef.current = 0;
    }
    const step = steps[indexRef.current];
    mappingRef.current = step.dictionnaire ?? {};
    showDecryption();
  }

  async function refresh() {
    refreshGen.current += 1;
    const generation = refreshGen.current;
    let steps;
    try {
      steps = await updateAttack(attackIdRef.current);
    } catch (error) {
      if (!mountedRef.current || generation !== refreshGen.current) {
        return;
      }
      throw error;
    }
    if (!mountedRef.current || generation !== refreshGen.current) {
      return;
    }
    stepsRef.current = steps;
    showCurrentStep();
    if (attackIsFinal(steps)) {
      finish();
    }
  }

  function goNext() {
    const steps = stepsRef.current;
    let index = indexRef.current + 1;
    if (index === steps.length) {
      notify("Comparaison avec le message clair", "info");
    }
    if (index > steps.length) {
      notify("Aucune analyse suivante disponible", "info");
      return;
    }
    indexRef.current = index;
    if (index > 0 && index < steps.length - 1) {
      const step = steps[index];
      mappingRef.current = step.dictionnaire ?? {};
      setMotChiffre(step.mot_chiffre);
      setMotTraduit(wordValue(step.mot_traduit));
    } else {
      setMotChiffre("");
      setMotTraduit("");
    }
    showDecryption();
  }

  function goPrevious() {
    const steps = stepsRef.current;
    const index = indexRef.current - 1;
    if (index < 0) {
      notify("Aucun analyse précédente disponible", "info");
      return;
    }
    const step = steps[index];
    indexRef.current = index;
    mappingRef.current = step.dictionnaire ?? {};
    if (index > 0 && index < steps.length - 1) {
      setMotChiffre(step.mot_chiffre);
      setMotTraduit(wordValue(step.mot_traduit));
    } else {
      setMotChiffre("");
      setMotTraduit("");
    }
    showDecryption();
  }

  async function play() {
    const cipherText = localStorage.getItem("cipherText");
    const attackId = readStoredAttackId();
    attackIdRef.current = attackId;
    if (!cipherText && !attackId) {
      notify("Aucun texte chiffré trouvé. Utilisez d'abord la page d'attaque.", "error");
      return;
    }
    if (!attackId) {
      notify("Aucune attaque en cours. Lancez d'abord l'attaque.", "error");
      return;
    }
    setPlaying(true);
    setEnergy(true);
    finishedRef.current = false;
    pollCountRef.current = 0;
    stopTimer();
    try {
      await refresh();
      if (finishedRef.current || !mountedRef.current) {
        return;
      }
      timerRef.current = window.setInterval(() => {
        pollCountRef.current += 1;
        refreshRef.current().then(() => {
          if (!finishedRef.current && pollCountRef.current >= POLL_LIMIT) {
            notifyRef.current("Erreur lors de l'analyse", "error");
            finishRef.current();
          }
        }).catch(() => {
          notifyRef.current("Erreur lors de l'analyse", "error");
          finishRef.current();
        });
      }, POLL_MS);
    } catch {
      notify("Erreur lors du démarrage de l'analyse", "error");
      finish();
    }
  }

  async function copyResult() {
    const text = compared ? displayedText(compared) : "";
    try {
      await navigator.clipboard.writeText(text);
      notify("Texte copié dans le presse-papiers", "success");
    } catch {
      notify("Erreur lors de la copie", "error");
    }
  }

  notifyRef.current = notify;
  finishRef.current = finish;
  refreshRef.current = refresh;

  useEffect(() => {
    mountedRef.current = true;
    document.title = "Déchiffrement par substitution";
    const storedCipher = readStoredCipher();
    const storedPlain = readStoredPlain();
    plainRef.current = storedPlain;
    setCipher(storedCipher);
    setPlain(storedPlain);
    if (!storedCipher || storedCipher.trim().length === 0) {
      notify("Aucun texte chiffré trouvé. Utilisez d'abord la page d'attaque.", "error");
    }
    return () => {
      mountedRef.current = false;
      stopTimer();
    };
  }, []);

  const correctCount = compared?.filter((item) => item.isCorrect).length ?? 0;
  const totalCount = compared?.length ?? 0;
  const accuracy = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(1) : "0";

  return (
    <>
      <div className={`loading-particles-overlay${energy ? " active" : ""}`} id="loadingParticlesOverlay">
        <div className="particles-container">
          {PARTICLES.map((particle) => <div className="particle" key={particle} />)}
        </div>
      </div>
      <div className="mapping-container">
        <section className="mapping-section">
          <h2 className="section-title">
            <i className="fas fa-swords" /> Déchiffrement par attaque
          </h2>
          <div className="row-2">
            <div className="mapping-section">
              <div className="mapping-controls">
                <button id="play" className="btn btn-primary" type="button" disabled={playing} onClick={play}>
                  <i className={playing ? "fas fa-spinner fa-spin" : "fas fa-play"} /> {playing ? "Analyse..." : "Commencer"}
                </button>
              </div>
              <div className="alphabet-mapping" id="alphabetMapping">
                <div className={`energy-dots${energy ? " active" : ""}`} id="energyDots">
                  <div className="energy-dot energy-dot-1" />
                  <div className="energy-dot energy-dot-2" />
                  <div className="energy-dot energy-dot-3" />
                  <div className="energy-dot energy-dot-4" />
                </div>
                <div className="alphabet-row french-alphabet top" id="cipherAlphabet">
                  {DECRYPT_ALPHABET.map((letter) => (
                    <div className="alphabet-letter cipher" key={`cipher-${letter}`}>{letter.toUpperCase()}</div>
                  ))}
                </div>
                <div className="arrows-row" id="arrowsRow">
                  {DECRYPT_ALPHABET.map((letter) => (
                    <div className="arrow" key={`arrow-${letter}`}>↓</div>
                  ))}
                </div>
                <div className="alphabet-row french-alphabet bottom" id="clearAlphabet">
                  {DECRYPT_ALPHABET.map((letter) => {
                    const clear = mapping[letter];
                    return (
                      <div className={`alphabet-letter ${clear ? "clear" : "empty"}`} key={`clear-${letter}`}>
                        {clear ? clear.toUpperCase() : "?"}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="comparison-section">
                <div className="text-display-row">
                  <div className="text-display-col">
                    <h4><i className="fas fa-lock" /> Texte Chiffré Original:</h4>
                    <textarea id="originalCipherText" rows={4} readOnly placeholder="Le texte chiffré original apparaîtra ici..." value={cipher} />
                  </div>
                  <div className="text-display-col">
                    <h4><i className="fas fa-unlock" /> Texte en Clair Original:</h4>
                    <textarea id="originalPlainText" rows={4} readOnly placeholder="Le texte en clair original apparaîtra ici (si disponible)..." value={plain} />
                  </div>
                </div>
              </div>
              <div className="words-section">
                <div className="text-display-row">
                  <button id="previousWord" className="btn btn-primary" type="button" onClick={goPrevious}>
                    <i className="fas fa-arrow-left" />
                  </button>
                  <div className="text-display-col">
                    <h4><i className="fas fa-lock" /> Mot chiffré</h4>
                    <textarea id="motChiffreText" rows={4} readOnly placeholder="Le mot chiffré apparaîtra ici..." value={motChiffre} />
                  </div>
                  <div className="text-display-col">
                    <h4><i className="fas fa-unlock" /> Mot traduit</h4>
                    <textarea id="motTraduitText" rows={4} readOnly placeholder="Le mot traduit apparaîtra ici..." value={motTraduit} />
                  </div>
                  <button id="nextWord" className="btn btn-primary" type="button" onClick={goNext}>
                    <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
              <div className="result-section">
                <h4><i className="fas fa-magic" /> Texte Déchiffré (Résultat):</h4>
                <textarea
                  id="decryptedText"
                  rows={4}
                  readOnly
                  placeholder="Le texte déchiffré apparaîtra ici..."
                  value=""
                  style={compared ? { display: "none" } : undefined}
                />
                {compared ? (
                  <>
                    <div id="coloredDecryptedText" className="colored-text-display">
                      {compared.map((item, index) => {
                        const shown = item.char === " " ? "\u00A0" : item.char;
                        if (item.isCorrect) {
                          return <span className="char-correct" key={index}>{shown}</span>;
                        }
                        if (item.isMissing) {
                          return <span className="char-missing" key={index}>_</span>;
                        }
                        if (item.isExtra) {
                          return <span className="char-extra" key={index}>{shown}</span>;
                        }
                        return <span className="char-incorrect" key={index}>{shown}</span>;
                      })}
                    </div>
                    <div id="comparisonStats" className="comparison-stats">
                      <div className="stats-content">
                        <span className="stat-item">
                          <i className="fas fa-check-circle" /> Précision: <strong>{accuracy}%</strong>
                        </span>
                        <span className="stat-item">
                          <i className="fas fa-chart-bar" /> {correctCount}/{totalCount} caractères corrects
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                <button id="copyResult" className="copy-btn" type="button" onClick={copyResult}>
                  <i className="fas fa-copy" /> Copier
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      {notices.map((notice, index) => (
        <div
          key={notice.id}
          className={`notification notification-${notice.type}`}
          style={{
            position: "fixed",
            top: 20 + index * 72,
            right: 20,
            background: notice.type === "success"
              ? "linear-gradient(135deg, #00ff88, #00cc6a)"
              : notice.type === "error"
                ? "linear-gradient(135deg, #ff6b6b, #ee5a52)"
                : "linear-gradient(135deg, #4dabf7, #339af0)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: 10,
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            zIndex: 10000,
            transform: notice.shown ? "translateX(0)" : "translateX(100%)",
            opacity: notice.shown ? 1 : 0,
            transition: "all 0.3s ease",
            maxWidth: 400,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={() => setNotices((current) => current.filter((item) => item.id !== notice.id))}
        >
          <div className="notification-content">
            <i className={`fas ${notice.type === "success" ? "fa-check-circle" : notice.type === "error" ? "fa-exclamation-triangle" : "fa-info-circle"}`} />
            <span>{notice.message}</span>
          </div>
        </div>
      ))}
    </>
  );
}
