import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/react-app/pages/Home";
import History from "@/react-app/pages/History";
import AnalyzePage from "@/react-app/pages/Analyze";
import GeminiAnalyzer from "@/react-app/pages/GeminiAnalyzer";
import LearnPage from "@/react-app/pages/Learn";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/gemini" element={<GeminiAnalyzer />} />
        <Route path="/history" element={<History />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </Router>
  );
}