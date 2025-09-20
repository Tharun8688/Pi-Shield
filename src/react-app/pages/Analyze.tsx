import { useState } from 'react';
import { FileText, Image, Video, Zap } from 'lucide-react';
import Header from '@/react-app/components/Header';
import TextAnalyzer from '@/react-app/components/TextAnalyzer';
import ImageAnalyzer from '@/react-app/components/ImageAnalyzer';
import VideoAnalyzer from '@/react-app/components/VideoAnalyzer';

type AnalyzerType = 'text' | 'image' | 'video';

export default function Analyze() {
  const [activeAnalyzer, setActiveAnalyzer] = useState<AnalyzerType>('text');

  const analyzers = [
    {
      id: 'text' as AnalyzerType,
      title: 'Text Analysis',
      description: 'Analyze articles, news, and social media posts for misinformation patterns',
      icon: FileText,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50'
    },
    {
      id: 'image' as AnalyzerType,
      title: 'Image Detection',
      description: 'Upload images and use OCR technology to extract and analyze text',
      icon: Image,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      id: 'video' as AnalyzerType,
      title: 'Video Analysis',
      description: 'Extract metadata and analyze video content for misinformation sources',
      icon: Video,
      color: 'from-green-600 to-blue-600',
      bgColor: 'from-green-50 to-blue-50'
    }
  ];

  const currentAnalyzer = analyzers.find(a => a.id === activeAnalyzer)!;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Content Analysis
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Multi-Modal
            </span>
            <br />
            <span className="text-gray-900">Analysis Platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your analysis type below to detect misinformation across text, images, and videos 
            with advanced AI-powered insights and real-time credibility scoring.
          </p>
        </div>

        {/* Analyzer Type Selector */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {analyzers.map((analyzer) => {
              const IconComponent = analyzer.icon;
              const isActive = activeAnalyzer === analyzer.id;
              
              return (
                <button
                  key={analyzer.id}
                  onClick={() => setActiveAnalyzer(analyzer.id)}
                  className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? `border-transparent bg-gradient-to-br ${analyzer.bgColor} shadow-2xl`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl'
                  }`}
                >
                  <div className={`inline-flex p-4 rounded-2xl mb-6 ${
                    isActive 
                      ? `bg-gradient-to-br ${analyzer.color}` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 ${
                    isActive ? 'text-gray-900' : 'text-gray-800'
                  }`}>
                    {analyzer.title}
                  </h3>
                  
                  <p className={`text-base leading-relaxed ${
                    isActive ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    {analyzer.description}
                  </p>
                  
                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${analyzer.color} flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Analyzer */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentAnalyzer.bgColor} rounded-3xl opacity-20`}></div>
          <div className="relative">
            {activeAnalyzer === 'text' && (
              <div className="animate-fadeIn">
                <TextAnalyzer />
              </div>
            )}
            
            {activeAnalyzer === 'image' && (
              <div className="animate-fadeIn">
                <ImageAnalyzer />
              </div>
            )}
            
            {activeAnalyzer === 'video' && (
              <div className="animate-fadeIn">
                <VideoAnalyzer />
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Lightning Fast</h4>
            <p className="text-gray-600">Get instant analysis results with our optimized AI engine</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Multi-Format</h4>
            <p className="text-gray-600">Analyze text, images, and videos in a single platform</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">OCR Technology</h4>
            <p className="text-gray-600">Extract and analyze text from images with precision</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Metadata Analysis</h4>
            <p className="text-gray-600">Deep video analysis with comprehensive metadata extraction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
