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
      <h2 className="section-title">Outil de Chiffrement/Déchiffrement</h2>
      <div className="cesar-layout">
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
          <div className="action-buttons">
            <button
              id="clearText"
              type="button"
              className="delete-button"
              aria-label="Effacer"
              onClick={() => { setInput(""); setOutput(""); setError(""); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 14" className="svgIcon bin-top" aria-hidden="true">
                <g clipPath="url(#clip0_35_24)">
                  <path fill="black" d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z" />
                </g>
                <defs>
                  <clipPath id="clip0_35_24">
                    <rect fill="white" height="14" width="69" />
                  </clipPath>
                </defs>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 69 57" className="svgIcon bin-bottom" aria-hidden="true">
                <g clipPath="url(#clip0_35_22)">
                  <path fill="black" d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z" />
                </g>
                <defs>
                  <clipPath id="clip0_35_22">
                    <rect fill="white" height="57" width="69" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
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
          <div
            className="transform-arrow"
            id="cesarMode"
            role="button"
            tabIndex={0}
            aria-label="Inverser"
            onClick={swapMode}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                swapMode();
              }
            }}
          >
            <i className={mode === "encrypt" ? "fas fa-arrow-down" : "fas fa-arrow-up"} id="transformIcon" />
          </div>
          <div className="text-group">
            <label htmlFor="outputText">{mode === "encrypt" ? "Chiffré" : "Message"}</label>
            <textarea id="outputText" rows={5} readOnly value={error || output} />
          </div>
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
    </div>
  );
}
