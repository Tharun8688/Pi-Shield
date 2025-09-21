import { useState } from 'react';
import { Upload, Video as VideoIcon, Send, AlertTriangle, CheckCircle, XCircle, Loader2, Info, Play } from 'lucide-react';
import type { AnalysisReport } from '@/shared/types';
import { fetchWithAuth } from '@/react-app/utils/api';

export default function VideoAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  type VideoMetadata = {
    duration?: string | number;
    resolution?: string;
    frameRate?: number | string;
    format?: string;
    codec?: string;
    creationDate?: string;
    [key: string]: unknown;
  } | null;

  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setVideoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        setVideoMetadata(null);
        setResult(null);
        setError(null);
      } else {
        setError('Please select a valid video file (MP4, AVI, MOV, etc.)');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setVideoMetadata(null);
      setResult(null);
      setError(null);
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const extractMetadata = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetchWithAuth('/api/extract-video-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Metadata extraction failed');
      }

      const data = await response.json();
      setVideoMetadata(data.metadata);
    } catch (err) {
      console.error('Metadata extraction error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during metadata extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeVideo = async () => {
    if (!videoMetadata) {
      setError('Please extract video metadata first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchWithAuth('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile?.name,
          metadata: videoMetadata,
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section id="video-analyzer" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Video Analysis
          </h2>
          <p className="text-xl text-gray-600">
            Extract metadata and analyze video content to identify potential misinformation sources
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-200/50">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-green-300 rounded-2xl p-8 mb-6 text-center hover:border-green-400 transition-colors cursor-pointer"
          >
            {!videoPreview ? (
              <div>
                <Upload className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload Video for Analysis
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop a video here, or click to select a file
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                >
                  <VideoIcon className="w-5 h-5 mr-2" />
                  Select Video
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports MP4, AVI, MOV, and other video formats
                </p>
              </div>
            ) : (
              <div>
                <div className="relative max-w-md mx-auto">
                  <video
                    src={videoPreview}
                    className="w-full rounded-xl shadow-lg mb-4"
                    controls
                    preload="metadata"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    <Play className="w-4 h-4 inline mr-1" />
                    Video
                  </div>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {selectedFile?.name}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {selectedFile && formatFileSize(selectedFile.size)}
                </p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setVideoPreview(null);
                    setVideoMetadata(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Choose Different Video
                </button>
              </div>
            )}
          </div>

          {/* Extract Metadata Button */}
          {selectedFile && (
            <div className="mb-6">
              <button
                onClick={extractMetadata}
                disabled={isExtracting}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
              >
                {isExtracting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Extracting Video Metadata...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Info className="w-6 h-6 mr-3" />
                    Extract Video Metadata
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Metadata Display */}
          {videoMetadata && (
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Info className="w-6 h-6 mr-3 text-blue-600" />
                Video Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="text-gray-800">{videoMetadata.duration || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Resolution:</span>
                    <span className="text-gray-800">{videoMetadata.resolution || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Frame Rate:</span>
                    <span className="text-gray-800">{videoMetadata.frameRate || 'Unknown'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Format:</span>
                    <span className="text-gray-800">{videoMetadata.format || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Codec:</span>
                    <span className="text-gray-800">{videoMetadata.codec || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">File Size:</span>
                    <span className="text-gray-800">{selectedFile && formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
              </div>
              {videoMetadata.creationDate && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Creation Date:</span>
                    <span className="text-gray-800">{videoMetadata.creationDate}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analyze Button */}
          {videoMetadata && (
            <button
              onClick={analyzeVideo}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 mb-6"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing Video Content...
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
                  {(() => {
                    const barColor = result.credibilityScore >= 80
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : result.credibilityScore >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600';

                    // Map score ranges to fixed Tailwind width classes to avoid inline styles
                    const widthClass = result.credibilityScore >= 80
                      ? 'w-4/5'
                      : result.credibilityScore >= 50
                      ? 'w-3/5'
                      : 'w-1/3';

                    return (
                      <div className={`h-3 rounded-full transition-all duration-1000 ${barColor} ${widthClass}`} />
                    );
                  })()}
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Video Content Analysis</h3>
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
                    {result.flags.map((flag: string, index: number) => (
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
                  {result.recommendations.map((recommendation: string, index: number) => (
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