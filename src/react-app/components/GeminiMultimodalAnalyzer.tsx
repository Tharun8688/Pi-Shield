import { useState } from 'react';
import { Upload, FileImage, FileVideo, FileAudio, FileText, AlertTriangle, CheckCircle, XCircle, Loader2, Sparkles, Brain } from 'lucide-react';
import type { AnalysisReport } from '@/shared/types';

type ContentType = 'text' | 'image' | 'video' | 'audio';

interface AnalysisResult extends AnalysisReport {
  extractedText?: string;
  technicalFindings?: string;
  aiModel?: string;
  filename?: string;
}

export default function GeminiMultimodalAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [textContent, setTextContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-detect content type
      if (file.type.startsWith('image/')) {
        setContentType('image');
      } else if (file.type.startsWith('video/')) {
        setContentType('video');
      } else if (file.type.startsWith('audio/')) {
        setContentType('audio');
      }
      
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      if (file.type.startsWith('image/')) {
        setContentType('image');
      } else if (file.type.startsWith('video/')) {
        setContentType('video');
      } else if (file.type.startsWith('audio/')) {
        setContentType('audio');
      }
      
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeContent = async () => {
    if (contentType === 'text' && !textContent.trim()) {
      setError('Please enter text content to analyze');
      return;
    }
    
    if (contentType !== 'text' && !selectedFile) {
      setError('Please select a file to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('contentType', contentType);
      
      if (customPrompt.trim()) {
        formData.append('analysisPrompt', customPrompt);
      }

      if (contentType === 'text') {
        formData.append('content', textContent);
      } else if (selectedFile) {
        formData.append(contentType, selectedFile);
      }

      const response = await fetch('/api/analyze-multimodal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (score >= 50) return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'image': return <FileImage className="w-5 h-5" />;
      case 'video': return <FileVideo className="w-5 h-5" />;
      case 'audio': return <FileAudio className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <section id="gemini-analyzer" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-600 mr-4" />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Gemini AI Analyzer
            </h2>
            <Brain className="w-12 h-12 text-blue-600 ml-4" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powered by Google's most advanced multimodal AI, capable of understanding and analyzing text, images, videos, and audio in a single unified system
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">Native Multimodal Analysis • No Preprocessing Required</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200/50">
          {/* Content Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-4">
              Choose Content Type to Analyze
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['text', 'image', 'video', 'audio'] as ContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setContentType(type);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setTextContent('');
                    setResult(null);
                    setError(null);
                  }}
                  className={`flex items-center justify-center px-4 py-3 rounded-2xl font-medium transition-all border-2 ${
                    contentType === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {getContentTypeIcon(type)}
                  <span className="ml-2 capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input for Text Content */}
          {contentType === 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Text Content to Analyze
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste any text content here - news articles, social media posts, claims, or any text you want to verify..."
                className="w-full h-40 p-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                disabled={isAnalyzing}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {textContent.length} characters
                </span>
              </div>
            </div>
          )}

          {/* File Upload Area for Media Content */}
          {contentType !== 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Upload {contentType.charAt(0).toUpperCase() + contentType.slice(1)} File
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm"
              >
                {!previewUrl ? (
                  <div>
                    <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Upload {contentType.charAt(0).toUpperCase() + contentType.slice(1)} for AI Analysis
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Gemini AI will analyze your {contentType} content directly - no preprocessing needed
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept={`${contentType}/*`}
                      className="hidden"
                      id={`${contentType}-upload`}
                    />
                    <label
                      htmlFor={`${contentType}-upload`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                    >
                      {getContentTypeIcon(contentType)}
                      <span className="ml-2">Select {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    {contentType === 'image' && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg mb-4"
                      />
                    )}
                    {contentType === 'video' && (
                      <video
                        src={previewUrl}
                        className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg mb-4"
                        controls
                        preload="metadata"
                      />
                    )}
                    {contentType === 'audio' && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-4">
                        <FileAudio className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                        <audio
                          src={previewUrl}
                          className="w-full"
                          controls
                          preload="metadata"
                        />
                      </div>
                    )}
                    <p className="text-gray-700 font-medium mb-4">
                      {selectedFile?.name}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResult(null);
                        setError(null);
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Choose Different File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Analysis Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Custom Analysis Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific instructions for the AI analysis, such as focus areas, context, or particular aspects to examine..."
              className="w-full h-24 p-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              disabled={isAnalyzing}
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeContent}
            disabled={isAnalyzing || (contentType === 'text' && !textContent.trim()) || (contentType !== 'text' && !selectedFile)}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 mb-6"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Gemini AI Analyzing {contentType.charAt(0).toUpperCase() + contentType.slice(1)}...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Brain className="w-6 h-6 mr-3" />
                Analyze with Gemini AI
              </span>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800 font-medium">Analysis Error</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* AI Model Badge */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {result.aiModel || 'Google Gemini 1.5 Flash'}
                  {result.filename && (
                    <span className="ml-2 opacity-75">• {result.filename}</span>
                  )}
                </div>
              </div>

              {/* Credibility Score */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Credibility Assessment</h3>
                  {getScoreIcon(result.credibilityScore)}
                </div>
                <div className="flex items-end space-x-4">
                  <span className={`text-5xl font-bold ${getScoreColor(result.credibilityScore)}`}>
                    {result.credibilityScore}
                  </span>
                  <span className="text-gray-600 text-xl font-medium mb-2">/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      result.credibilityScore >= 80
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : result.credibilityScore >= 50
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${result.credibilityScore}%` }}
                  />
                </div>
              </div>

              {/* Extracted Text (if available) */}
              {result.extractedText && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-green-600" />
                    Extracted Text Content
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-green-200 max-h-40 overflow-y-auto">
                    <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm">
                      {result.extractedText}
                    </pre>
                  </div>
                </div>
              )}

              {/* Technical Findings (if available) */}
              {result.technicalFindings && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Brain className="w-6 h-6 mr-3 text-purple-600" />
                    Technical Analysis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{result.technicalFindings}</p>
                </div>
              )}

              {/* Main Analysis */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>
                <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
              </div>

              {/* Warning Flags */}
              {result.flags.length > 0 && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    Warning Flags
                  </h3>
                  <ul className="space-y-2">
                    {result.flags.map((flag, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span className="text-red-800">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Verification Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-blue-800">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Reasoning */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">AI Reasoning</h3>
                <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
