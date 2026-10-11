import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { frenchFrequencies } from "../api/frequencies";
import {
  calculateFrequencies,
  cleanForAnalysis,
  matchConfidence,
  rankedLetters,
  readStoredCipher,
  type FrequencyTable,
  type RankedLetter,
} from "../substitutionAnalyse";
import "../styles/main.css";
import "../styles/substitution_annalyse.css";

const ARROW_PATH = "M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z";

type NoticeType = "success" | "error" | "info";

type Notice = {
  id: number;
  message: string;
  type: NoticeType;
  shown: boolean;
};

type TooltipInfo = {
  x: number;
  y: number;
  letter: string;
  frequency: number;
  kind: "cipher" | "french";
  rank?: number;
};

type Match = {
  cipher: string;
  french: string;
  confidence: number;
};

function ArrowButton({ id, icon, label, onClick }: { id: string; icon: string; label: string; onClick: () => void }) {
  return (
    <button id={id} className="btn btn-primary" type="button" onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
        <path d={ARROW_PATH} />
      </svg>
      <span className="text"><i className={icon} /> {label}</span>
      <span className="circle" />
      <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
        <path d={ARROW_PATH} />
      </svg>
    </button>
  );
}

function FrequencyBars({
  bars,
  kind,
  onHover,
  onLeave,
  onCipherClick,
}: {
  bars: RankedLetter[];
  kind: "cipher" | "french";
  onHover: (info: TooltipInfo) => void;
  onLeave: () => void;
  onCipherClick: (letter: string, frequency: number) => void;
}) {
  if (bars.length === 0) {
    return null;
  }
  const maxFrequency = Math.max(...bars.map((bar) => bar.frequency));
  return bars.map((bar, index) => {
    const width = (bar.frequency / maxFrequency) * 100;
    return (
      <div
        key={`${kind}-${bar.letter}`}
        className="chart-bar"
        onMouseEnter={(event) => onHover({
          x: event.clientX,
          y: event.clientY,
          letter: bar.letter,
          frequency: bar.frequency,
          kind,
          rank: kind === "french" ? index + 1 : undefined,
        })}
        onMouseMove={(event) => onHover({
          x: event.clientX,
          y: event.clientY,
          letter: bar.letter,
          frequency: bar.frequency,
          kind,
          rank: kind === "french" ? index + 1 : undefined,
        })}
        onMouseLeave={onLeave}
        onClick={() => {
          if (kind === "cipher") {
            onCipherClick(bar.letter, bar.frequency);
          }
        }}
      >
        <div className="bar-letter">{bar.letter.toUpperCase()}</div>
        <div className="bar-container">
          <div className="bar-fill" style={{ width: `${width}%` }}>
            <div className="bar-inner-value">{bar.frequency.toFixed(1)}%</div>
          </div>
        </div>
        <div className="bar-value">{bar.frequency.toFixed(1)}%</div>
      </div>
    );
  });
}

export default function SubstitutionAnalysePage() {
  const navigate = useNavigate();
  const [french, setFrench] = useState<FrequencyTable | null>(null);
  const [preview, setPreview] = useState("");
  const [cipherBars, setCipherBars] = useState<RankedLetter[]>([]);
  const [letterCount, setLetterCount] = useState(0);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [highlighted, setHighlighted] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const noticeSeq = useRef(0);

  useEffect(() => {
    document.title = "Analyse de fréquence";
  }, []);

  function notify(message: string, type: NoticeType) {
    noticeSeq.current += 1;
    const id = noticeSeq.current;
    setNotices((current) => [...current, { id, message, type, shown: false }]);
    window.setTimeout(() => {
      setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, shown: true } : notice));
    }, 100);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 3300);
  }

  function analyze(text: string, frenchTable: FrequencyTable | null) {
    if (!text || text.trim().length === 0) {
      notify("Aucun texte chiffré trouvé. Utilisez d'abord la page d'attaque.", "error");
      return;
    }
    if (text.length < 20) {
      notify("Texte trop court pour une analyse fiable (minimum 20 caractères)", "error");
      return;
    }
    const cleaned = cleanForAnalysis(text);
    if (cleaned.length === 0) {
      notify("Aucune lettre trouvée dans le texte", "error");
      return;
    }
    const frequencies = calculateFrequencies(cleaned);
    const cipherRank = rankedLetters(frequencies, 30, true);
    setPreview(text);
    setCipherBars(cipherRank);
    setLetterCount(cleaned.length);
    setUniqueCount(Object.values(frequencies).filter((frequency) => frequency > 0).length);
    if (frenchTable) {
      const frenchRank = rankedLetters(frenchTable, 29, false);
      const pairs = cipherRank.slice(0, 29).flatMap((cipher, index) => {
        const clear = frenchRank[index];
        if (!clear) {
          return [];
        }
        return [{
          cipher: cipher.letter,
          french: clear.letter,
          confidence: matchConfidence(cipher.frequency, clear.frequency),
        }];
      });
      setMatches(pairs);
      notify("Mapping automatique généré", "success");
    } else {
      setMatches(null);
    }
    notify(`Analyse terminée: ${cleaned.length} lettres analysées`, "success");
  }

  useEffect(() => {
    let cancelled = false;
    frenchFrequencies()
      .then((table) => {
        if (cancelled) {
          return;
        }
        setFrench(table);
        analyze(readStoredCipher(), table);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        notify("Erreur lors du chargement des fréquences françaises", "error");
        analyze(readStoredCipher(), null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const frenchBars = french ? rankedLetters(french, 27, false) : [];

  function selectCipherLetter(letter: string, frequency: number) {
    setHighlighted(letter);
    window.setTimeout(() => setHighlighted(""), 1000);
    notify(`Lettre ${letter.toUpperCase()} sélectionnée (${frequency.toFixed(1)}%)`, "info");
  }

  return (
    <div className="frequency-analysis-container">
      <section className="analysis-section">
        <h2 className="section-title">
          <i className="fas fa-chart-line" /> Analyse de Fréquences
        </h2>
        <div className="row-1">
          <div className="cipher-frequency-column">
            <h3><i className="fas fa-lock" /> Fréquences du Texte Chiffré</h3>
            <div className="chart-container">
              <div id="cipherChart" className="custom-chart cipher-chart">
                <div className="chart-title">🔒 FRÉQUENCES CHIFFRÉES</div>
                <div className="chart-bars" id="cipherBars">
                  {cipherBars.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔒</div>
                      <div className="empty-message">Aucun texte chiffré analysé</div>
                    </div>
                  ) : (
                    <FrequencyBars
                      bars={cipherBars}
                      kind="cipher"
                      onHover={setTooltip}
                      onLeave={() => setTooltip(null)}
                      onCipherClick={selectCipherLetter}
                    />
                  )}
                </div>
                <div className="chart-legend" id="cipherLegend" />
              </div>
            </div>
            <div className="stats">
              <span>Lettres: <strong id="cipherLetterCount">{letterCount}</strong></span>
              <span>Uniques: <strong id="cipherUniqueCount">{uniqueCount}</strong></span>
            </div>
            <div className="cipher-preview" id="cipherPreview">
              {preview
                ? <span title={`Texte complet: ${preview}`}>{preview}</span>
                : <span className="placeholder-text">En attente du texte chiffré...</span>}
            </div>
            <div className="control-buttons">
              <ArrowButton
                id="refreshAnalysis"
                icon="fas fa-sync-alt"
                label="Actualiser"
                onClick={() => analyze(readStoredCipher(), french)}
              />
            </div>
          </div>
          <div className="french-comparison-column">
            <h3><i className="fas fa-balance-scale" /> Comparaison Française</h3>
            <div className="chart-container">
              <div id="frenchChart" className="custom-chart french-chart">
                <div className="chart-title">FRÉQUENCES FRANÇAISES</div>
                <div className="chart-bars" id="frenchBars">
                  <FrequencyBars
                    bars={frenchBars}
                    kind="french"
                    onHover={setTooltip}
                    onLeave={() => setTooltip(null)}
                    onCipherClick={selectCipherLetter}
                  />
                </div>
                <div className="chart-legend" id="frenchLegend" />
              </div>
            </div>
            <div className="suggested-matches">
              <h4>Correspondances Suggérées</h4>
              <div className="matches-container" id="suggestedMatches">
                {matches === null ? (
                  <div className="match-info">
                    <i className="fas fa-info-circle" />
                    <span>Analysez un texte pour voir les correspondances</span>
                  </div>
                ) : matches.map((match) => (
                  <div
                    key={`${match.cipher}-${match.french}`}
                    className="match-item"
                    title={`Confiance: ${match.confidence}%`}
                    style={highlighted === match.cipher ? {
                      background: "rgba(0, 255, 136, 0.2)",
                      transform: "scale(1.05)",
                    } : undefined}
                    onClick={() => {
                      notify(`Correspondance ${match.cipher.toUpperCase()} → ${match.french.toUpperCase()} appliquée`, "success");
                    }}
                  >
                    <span className="match-cipher">{match.cipher.toUpperCase()}</span>
                    <span className="match-arrow">→</span>
                    <span className="match-clear">{match.french.toUpperCase()}</span>
                    <span className="match-confidence">{match.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="next-step-btn">
              <ArrowButton
                id="nextStep"
                icon="fas fa-angle-right"
                label="Étape suivante"
                onClick={() => navigate("/substitution_dechiffre")}
              />
            </div>
          </div>
        </div>
      </section>
      {notices.map((notice, index) => (
        <div key={notice.id} className={`notification ${notice.type}${notice.shown ? " show" : ""}`} style={{ top: 20 + index * 72 }}>
          <i className={`fas fa-${notice.type === "success" ? "check" : notice.type === "error" ? "exclamation-triangle" : "info"}`} />
          <span>{notice.message}</span>
        </div>
      ))}
      {tooltip ? (
        <div
          id="chart-tooltip"
          style={{
            position: "fixed",
            left: tooltip.x + 15,
            top: tooltip.y - 10,
            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95))",
            color: "white",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 1000,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 6, textAlign: "center" }}>
            <strong style={{ color: tooltip.kind === "cipher" ? "#00ff88" : "#ff6b6b" }}>
              {tooltip.letter.toUpperCase()}
            </strong>
          </div>
          <div style={{ color: "#cccccc", textAlign: "center", marginBottom: 4 }}>
            Fréquence: <strong style={{ color: "white" }}>{tooltip.frequency.toFixed(2)}%</strong>
          </div>
          {tooltip.rank ? <div style={{ color: "#999999", fontSize: 11 }}>Rang: #{tooltip.rank}</div> : null}
          <div style={{ color: "#999999", fontSize: 12, marginTop: 6, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 4 }}>
            {tooltip.kind === "cipher" ? "🔒 Texte chiffré" : " Référence française"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
