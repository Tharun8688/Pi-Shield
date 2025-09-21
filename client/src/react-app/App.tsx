import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from '../../../src/react-app/pages/Home';
import History from '../../../src/react-app/pages/History';
import AnalyzePage from '../../../src/react-app/pages/Analyze';
import GeminiAnalyzer from '../../../src/react-app/pages/GeminiAnalyzer';
import LearnPage from '../../../src/react-app/pages/Learn';

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