import Header from '@/react-app/components/Header';
import Hero from '@/react-app/components/Hero';
import TextAnalyzer from '@/react-app/components/TextAnalyzer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <TextAnalyzer />
      </main>
    </div>
  );
}
