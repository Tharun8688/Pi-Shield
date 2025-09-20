import { useState } from 'react';
import { Upload, Image as ImageIcon, Send, AlertTriangle, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import type { AnalysisReport } from '@/shared/types';

export default function ImageAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        setExtractedText('');
        setResult(null);
        setError(null);
      } else {
        setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setExtractedText('');
      setResult(null);
      setError(null);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const extractText = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Text extraction failed');
      }

      const data = await response.json();
      setExtractedText(data.extractedText || '');
    } catch (err) {
      console.error('Text extraction error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during text extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeImage = async () => {
    if (!extractedText.trim()) {
      setError('Please extract text from the image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: extractedText,
          contentType: 'image',
        }),
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

  return (
    <section id="image-analyzer" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Image Detection
          </h2>
          <p className="text-xl text-gray-600">
            Upload images and use OCR technology to extract and analyze text for misleading content
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 border border-purple-200/50">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-purple-300 rounded-2xl p-8 mb-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
          >
            {!imagePreview ? (
              <div>
                <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload Image for Analysis
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop an image here, or click to select a file
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Select Image
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports JPG, PNG, GIF, and other image formats
                </p>
              </div>
            ) : (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg mb-4"
                />
                <p className="text-gray-700 font-medium mb-4">
                  {selectedFile?.name}
                </p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                    setExtractedText('');
                    setResult(null);
                    setError(null);
                  }}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Choose Different Image
                </button>
              </div>
            )}
          </div>

          {/* Extract Text Button */}
          {selectedFile && (
            <div className="mb-6">
              <button
                onClick={extractText}
                disabled={isExtracting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
              >
                {isExtracting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Extracting Text from Image...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Eye className="w-6 h-6 mr-3" />
                    Extract Text with OCR
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Extracted Text Display */}
          {extractedText && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Extracted Text
              </label>
              <div className="bg-white p-4 border border-gray-300 rounded-2xl max-h-40 overflow-y-auto">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm">
                  {extractedText}
                </pre>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {extractedText.length} characters extracted
                </span>
                {extractedText.length >= 10 && (
                  <span className="text-sm text-green-600 font-medium">
                    Ready for analysis
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {extractedText && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing || extractedText.trim().length < 10}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 mb-6"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing Extracted Text...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="w-6 h-6 mr-3" />
                  Analyze for Misinformation
                </span>
              )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Credibility Score */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Credibility Score</h3>
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

              {/* Analysis */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Image Content Analysis</h3>
                <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
              </div>

              {/* Flags */}
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

              {/* Reasoning */}
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
