import { useEffect, type ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import SiteSidebar from "./SiteSidebar";
import "../styles/main.css";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/sidebar.css";

const VANTA_OPTIONS = {
  color: 0x00ff88,
  backgroundColor: 0x0a0a15,
  points: 20,
  maxDistance: 25,
  spacing: 20,
  showDots: true,
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200,
  minWidth: 200,
  scale: 1,
  scaleMobile: 1,
  speed: 0.5,
};

export default function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    let effect: { destroy: () => void } | null = null;
    let attempts = 0;
    let cancelled = false;
    const timer = window.setInterval(() => {
      attempts += 1;
      const target = document.getElementById("vanta-bg");
      if (cancelled) {
        window.clearInterval(timer);
        return;
      }
      if (window.VANTA?.NET && target) {
        window.clearInterval(timer);
        effect = window.VANTA.NET({ el: target, ...VANTA_OPTIONS });
        return;
      }
      if (attempts >= 50 && target) {
        window.clearInterval(timer);
        target.style.background = "linear-gradient(135deg, #0a0a15 0%, #1a1a2e 50%, #0a0a15 100%)";
      }
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      effect?.destroy();
    };
  }, []);

  return (
    <>
      <div id="vanta-bg" />
      <div className="app">
        <SiteSidebar />
        <SiteHeader />
        <div className="content">{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
