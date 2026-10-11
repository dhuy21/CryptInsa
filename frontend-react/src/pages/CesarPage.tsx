import { useEffect, useRef, useState } from "react";
import { cesar, normalizeForCesar, type CesarMode } from "../api/cesar";
import "../styles/main.css";
import "../styles/cesar.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_,.";
const WHEEL = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "__", ",", "."];

const examples = [
  { text: "HELLO WORLD", shift: 0, output: "HELLO WORLD" },
  { text: "CRYPTOGRAPHIE", shift: 3, output: "FU,SWRJUDSKLH" },
  { text: "VIVE LA FRANCE", shift: 13, output: "FVFRKYNKSBN PR" },
];

export default function CesarPage() {
  const [shift, setShift] = useState(0);
  const [mode, setMode] = useState<CesarMode>("encrypt");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const wheelRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startAngle: 0, shift: 0 });

  useEffect(() => {
    drag.current.shift = shift;
  }, [shift]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) {
      return undefined;
    }
    const ring = wheel;
    let rotating = false;
    let startAngle = 0;

    function angleOf(clientX: number, clientY: number): number {
      const rect = ring.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return Math.atan2(clientY - centerY, clientX - centerX);
    }

    function applyDelta(nextAngle: number) {
      const deltaAngle = nextAngle - startAngle;
      const deltaShift = Math.round((-deltaAngle * 29) / (2 * Math.PI));
      const nextShift = Math.max(0, Math.min(28, drag.current.shift + deltaShift));
      if (nextShift !== drag.current.shift) {
        drag.current.shift = nextShift;
        startAngle = nextAngle;
        setShift(nextShift);
      }
    }

    function onMouseDown(event: MouseEvent) {
      event.preventDefault();
      rotating = true;
      startAngle = angleOf(event.clientX, event.clientY);
    }

    function onMouseMove(event: MouseEvent) {
      if (!rotating) {
        return;
      }
      event.preventDefault();
      applyDelta(angleOf(event.clientX, event.clientY));
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) {
        return;
      }
      event.preventDefault();
      rotating = true;
      const touch = event.touches[0];
      startAngle = angleOf(touch.clientX, touch.clientY);
    }

    function onTouchMove(event: TouchEvent) {
      if (!rotating || event.touches.length !== 1) {
        return;
      }
      event.preventDefault();
      const touch = event.touches[0];
      applyDelta(angleOf(touch.clientX, touch.clientY));
    }

    function stop() {
      rotating = false;
    }

    ring.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    ring.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stop);
    return () => {
      ring.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      ring.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  function swapMode() {
    setInput(output);
    setOutput(input);
    setMode((current) => current === "encrypt" ? "decrypt" : "encrypt");
  }

  useEffect(() => {
    document.title = "Illustration du chiffrement de César";
  }, []);

  useEffect(() => {
    const text = input.trim();
    if (!text) {
      setOutput("");
      setError("");
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      cesar(normalizeForCesar(text), shift, mode)
        .then((result) => {
          if (cancelled) {
            return;
          }
          setOutput(result);
          setError("");
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          setOutput("");
          setError("Erreur de connexion au serveur");
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [input, shift, mode]);

  const rotation = -(shift * 360) / 29;
  const cipherLetter = ALPHABET[(shift % 29 + 29) % 29];

  return (
    <div className="cesar-page">
      <div className="cesar-container">
        <section className="tool-section">
          <div className="container">
            <h2 className="section-title">Outil de Chiffrement/Déchiffrement</h2>
            <div className="tool-container">
              <div className="controls-section">
                <div className="wheel-container">
                  <h3>Roue de Chiffrement</h3>
                  <div className="caesar-wheel">
                    <div className="wheel-outer">
                      <div className="wheel-letters outer-letters">
                        {WHEEL.map((letter, letterIndex) => (
                          <span className="letter" data-index={letterIndex} key={`outer-${letterIndex}`}>{letter}</span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="wheel-inner"
                      ref={wheelRef}
                      style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                    >
                      <div className="wheel-letters inner-letters">
                        {WHEEL.map((letter, letterIndex) => (
                          <span className="letter" data-index={letterIndex} key={`inner-${letterIndex}`}>{letter}</span>
                        ))}
                      </div>
                      <div className="wheel-center" />
                      <div className="wheel-handle">
                        <i className="fas fa-arrows-rotate" />
                      </div>
                    </div>
                    <div className="wheel-indicator">
                      <div className="indicator-line" />
                      <div className="indicator-text">
                        <div className="correspondence">
                          <span className="original-letter">A</span>
                          <span className="arrow">{mode === "encrypt" ? "→" : "←"}</span>
                          <span className="cipher-letter">{cipherLetter}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="wheel-info">
                    <div className="current-shift">
                      Décalage: <span>{shift}</span>
                    </div>
                  </div>
                </div>
                <div className="text-areas">
                  <div className="text-group">
                    <label htmlFor="inputText">{mode === "encrypt" ? "Message" : "Chiffré"}</label>
                    <textarea
                      id="inputText"
                      rows={5}
                      placeholder="Entrez votre texte ici..."
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                    />
                  </div>
                  <button type="button" className="transform-arrow" onClick={swapMode} aria-label="Inverser">
                    <i className={mode === "encrypt" ? "fas fa-arrow-down" : "fas fa-arrow-up"} />
                  </button>
                  <div className="text-group">
                    <label htmlFor="outputText">{mode === "encrypt" ? "Chiffré" : "Message"}</label>
                    <textarea id="outputText" rows={5} readOnly value={error || output} />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => { setInput(""); setOutput(""); }}>
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="examples-section">
        <h3>Exemples :</h3>
        <div className="examples-grid">
          {examples.map((example) => (
            <button
              className="example-card"
              type="button"
              key={example.text}
              onClick={() => {
                setMode("encrypt");
                setShift(example.shift);
                setInput(example.text);
              }}
            >
              <div className="example-input">{example.text}</div>
              <div className="example-arrow">→ (clé: {example.shift})</div>
              <div className="example-output">{example.output}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
