import Header from '@/react-app/components/Header';
import GeminiMultimodalAnalyzer from '@/react-app/components/GeminiMultimodalAnalyzer';

export default function GeminiAnalyzer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main>
        <div className="pt-20">
          <GeminiMultimodalAnalyzer />
        </div>
      </main>
    </div>
  );
}
