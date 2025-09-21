import { Shield, Eye, Brain, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_70%)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/50 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-800 text-sm font-medium mb-8 border border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Now with Google Gemini Multimodal AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Combat
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Misinformation
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Powered by Google's most advanced Gemini AI, analyze text, images, videos, and audio 
            in a single unified system to detect misinformation and build critical thinking skills.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a href="/gemini" className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              <span className="flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Try Gemini AI
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </span>
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                NEW
              </div>
            </a>
            <a href="/analyze" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
              <span className="flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                Standard Analysis
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </span>
            </a>
            <a href="/history" className="text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all">
              View History
            </a>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multimodal AI Analysis</h3>
              <p className="text-gray-600 text-center">Analyze text, images, videos, and audio simultaneously with Google Gemini's advanced AI.</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Detection</h3>
              <p className="text-gray-600 text-center">Instantly identify misinformation patterns with native vision and audio processing.</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deep Reasoning</h3>
              <p className="text-gray-600 text-center">Get detailed AI explanations and credibility assessments with technical forensics.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}