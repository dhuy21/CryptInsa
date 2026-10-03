import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteShell from "./components/SiteShell";
import AboutPage from "./pages/AboutPage";
import CesarPage from "./pages/CesarPage";
import HelpPage from "./pages/HelpPage";
import HomePage from "./pages/HomePage";
import SubstitutionAnalysePage from "./pages/SubstitutionAnalysePage";
import SubstitutionAttackPage from "./pages/SubstitutionAttackPage";
import SubstitutionDecryptPage from "./pages/SubstitutionDecryptPage";
import SubstitutionPage from "./pages/SubstitutionPage";

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about_us" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/cesar" element={<CesarPage />} />
        <Route path="/substitution" element={<SubstitutionPage />} />
        <Route path="/substitution_attaque" element={<SubstitutionAttackPage />} />
        <Route path="/substitution_annalyse" element={<SubstitutionAnalysePage />} />
        <Route path="/substitution_dechiffre" element={<SubstitutionDecryptPage />} />
      </Routes>
      </SiteShell>
    </BrowserRouter>
  );
}
