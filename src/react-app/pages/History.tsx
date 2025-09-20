import { useState, useEffect } from 'react';
import { Clock, FileText, Image, Video, Eye, Download, Search, Filter, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@getmocha/users-service/react';
import Header from '@/react-app/components/Header';

interface HistoryItem {
  id: number;
  content_type: string;
  credibility_score: number;
  content_preview: string;
  created_at: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [hasMore, setHasMore] = useState(true);
  const { user, redirectToLogin, isPending } = useAuth();

  useEffect(() => {
    if (!isPending) {
      loadHistory();
    }
  }, [user, isPending]);

  const loadHistory = async (offset = 0) => {
    try {
      // Use different endpoint based on authentication status
      const endpoint = user ? `/api/analysis-history?limit=20&offset=${offset}` : `/api/analysis-history/public?limit=10&offset=${offset}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        if (response.status === 401 && user) {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw new Error('Failed to load history');
      }
      const data = await response.json();
      
      if (offset === 0) {
        setHistory(data.analyses || []);
      } else {
        setHistory(prev => [...prev, ...(data.analyses || [])]);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('History load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.content_preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportHistory = () => {
    const exportData = filteredHistory.map(item => ({
      id: item.id,
      type: item.content_type,
      credibility_score: item.credibility_score,
      content_preview: item.content_preview,
      analyzed_at: item.created_at
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pi-shield-analysis-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analysis History
          </h1>
          <p className="text-xl text-gray-600">
            {user ? 'Track your content analysis history with detailed reports and insights' : 'View recent public analysis results'}
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center text-blue-800">
                <Lock className="w-5 h-5 mr-2" />
                <span className="font-medium">Sign in to access your personal analysis history</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search analysis history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="article">Article</option>
                  <option value="post">Social Post</option>
                  <option value="news">News</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            {/* Export Button - only show for authenticated users */}
            {user && (
              <button
                onClick={exportHistory}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Export History
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-800 text-lg font-medium mb-2">Unable to Load History</div>
            <div className="text-red-600">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                loadHistory();
              }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHistory.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200/50">
            {user ? (
              <>
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Analysis History</h3>
                <p className="text-gray-600 text-lg mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'No results match your search criteria. Try adjusting your filters.'
                    : 'Start analyzing content to build your personal analysis history.'}
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Start Analyzing Content
                </a>
              </>
            ) : (
              <>
                <LogIn className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign In for Personal History</h3>
                <p className="text-gray-600 text-lg mb-6">
                  Sign in with Google to track your analysis history and access advanced features.
                </p>
                <button
                  onClick={redirectToLogin}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all mr-4"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In with Google
                </button>
                <a
                  href="/"
                  className="inline-flex items-center px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Analyze Content
                </a>
              </>
            )}
          </div>
        )}

        {/* History Items */}
        {!loading && !error && filteredHistory.length > 0 && (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {getTypeIcon(item.content_type)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 capitalize">
                            {item.content_type} Analysis
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-gray-700 mb-4">
                        {item.content_preview}
                        {item.content_preview.length >= 200 && '...'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                      <div className={`px-4 py-2 rounded-full font-bold text-lg ${getScoreColor(item.credibility_score)}`}>
                        {item.credibility_score}/100
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-8">
                <button
                  onClick={() => loadHistory(history.length)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
