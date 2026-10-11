/// <reference types="vite/client" />

interface VantaNetEffect {
  destroy: () => void;
}

interface Window {
  VANTA?: {
    NET: (options: { el: string | HTMLElement } & Record<string, unknown>) => VantaNetEffect;
  };
}
