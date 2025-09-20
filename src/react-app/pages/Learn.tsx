import { useState } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Search, Brain, Trophy, Target, ArrowRight } from 'lucide-react';
import Header from '@/react-app/components/Header';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'fundamentals' | 'techniques' | 'advanced' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  completed: boolean;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function Learn() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz' | 'practice'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const lessons: Lesson[] = [
    {
      id: 'what-is-misinformation',
      title: 'What is Misinformation?',
      description: 'Learn the fundamentals of misinformation, disinformation, and mal-information',
      category: 'fundamentals',
      difficulty: 'beginner',
      duration: '10 min',
      completed: completedLessons.has('what-is-misinformation')
    },
    {
      id: 'source-verification',
      title: 'Source Verification Techniques',
      description: 'Master the art of checking sources and verifying information credibility',
      category: 'techniques',
      difficulty: 'beginner',
      duration: '15 min',
      completed: completedLessons.has('source-verification')
    },
    {
      id: 'reverse-image-search',
      title: 'Reverse Image Search',
      description: 'Learn how to use reverse image search to verify visual content',
      category: 'techniques',
      difficulty: 'intermediate',
      duration: '12 min',
      completed: completedLessons.has('reverse-image-search')
    },
    {
      id: 'deepfake-detection',
      title: 'Spotting Deepfakes',
      description: 'Identify AI-generated videos and images with expert techniques',
      category: 'advanced',
      difficulty: 'advanced',
      duration: '20 min',
      completed: completedLessons.has('deepfake-detection')
    },
    {
      id: 'bias-recognition',
      title: 'Recognizing Bias',
      description: 'Understand different types of bias and how they affect information',
      category: 'fundamentals',
      difficulty: 'intermediate',
      duration: '18 min',
      completed: completedLessons.has('bias-recognition')
    },
    {
      id: 'fact-checking-tools',
      title: 'Fact-Checking Tools',
      description: 'Explore professional fact-checking resources and tools',
      category: 'techniques',
      difficulty: 'intermediate',
      duration: '14 min',
      completed: completedLessons.has('fact-checking-tools')
    }
  ];

  const quizQuestions: Question[] = [
    {
      id: 'q1',
      question: 'What is the main difference between misinformation and disinformation?',
      options: [
        'Misinformation is always intentional, disinformation is accidental',
        'Disinformation is deliberately false, misinformation may be unintentional',
        'There is no difference between the two terms',
        'Misinformation is about politics, disinformation is about science'
      ],
      correctAnswer: 1,
      explanation: 'Disinformation is deliberately created and spread with the intent to deceive, while misinformation can be false information spread without malicious intent.'
    },
    {
      id: 'q2',
      question: 'What should you do FIRST when you encounter a suspicious news article?',
      options: [
        'Share it immediately to warn others',
        'Check the publication date and source',
        'Read only the headline',
        'Assume it\'s false and ignore it'
      ],
      correctAnswer: 1,
      explanation: 'Always start by checking the source, publication date, and author credentials before making any judgments about the content.'
    },
    {
      id: 'q3',
      question: 'Which of these is a red flag for potential misinformation?',
      options: [
        'Multiple credible sources reporting the same story',
        'Emotional language designed to provoke strong reactions',
        'Clear attribution of quotes and sources',
        'Recent publication date'
      ],
      correctAnswer: 1,
      explanation: 'Emotional language designed to provoke anger, fear, or outrage is often a sign of misinformation, as it tries to bypass critical thinking.'
    },
    {
      id: 'q4',
      question: 'What is the best way to verify an image you see online?',
      options: [
        'Trust it if it looks realistic',
        'Check if it has a watermark',
        'Use reverse image search tools',
        'Only trust images from social media'
      ],
      correctAnswer: 2,
      explanation: 'Reverse image search tools like Google Images, TinEye, or Yandex can help you find the original source and context of an image.'
    }
  ];

  const practiceScenarios = [
    {
      id: 'scenario1',
      title: 'Breaking News Alert',
      content: 'You see a shocking headline on social media claiming "Scientists Discover Cure for Cancer, Big Pharma Tries to Hide It!" with 50,000 shares.',
      task: 'What steps would you take to verify this information?',
      solution: [
        'Check the source - is it a credible news organization?',
        'Look for the original research or press release',
        'Search for coverage by multiple reliable news sources',
        'Check fact-checking websites like Snopes or FactCheck.org',
        'Look for quotes from verified medical experts'
      ]
    },
    {
      id: 'scenario2',
      title: 'Viral Video',
      content: 'A video is circulating showing what appears to be a politician making controversial statements. The video has poor audio quality and the politician\'s mouth movements look slightly off.',
      task: 'How would you determine if this video is authentic?',
      solution: [
        'Check for official statements from the politician or their office',
        'Look for coverage by established news outlets',
        'Examine the video quality and technical aspects',
        'Use reverse video search if available',
        'Check the metadata and source of the original upload'
      ]
    }
  ];

  const completeLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setSelectedLesson(null);
  };

  const getLessonContent = (lessonId: string) => {
    const content: { [key: string]: any } = {
      'what-is-misinformation': {
        title: 'Understanding Misinformation',
        sections: [
          {
            title: 'Definitions',
            content: 'Misinformation is false or inaccurate information, regardless of intent. Disinformation is deliberately false information spread with intent to deceive. Mal-information is genuine information shared to cause harm.'
          },
          {
            title: 'Why It Matters',
            content: 'Misinformation can influence elections, public health decisions, and social cohesion. It spreads faster than accurate information on social media platforms.'
          },
          {
            title: 'Common Forms',
            content: 'False news articles, manipulated images, out-of-context videos, fake social media profiles, and misleading statistics are all common forms of misinformation.'
          }
        ]
      },
      'source-verification': {
        title: 'Verifying Sources',
        sections: [
          {
            title: 'Check the Source',
            content: 'Look for established news organizations with editorial standards. Check the About page, funding sources, and editorial policies.'
          },
          {
            title: 'Cross-Reference',
            content: 'Verify information with multiple independent sources. Be suspicious if only one source is reporting a major story.'
          },
          {
            title: 'Check Author Credentials',
            content: 'Research the author\'s background and expertise. Look for their other work and any potential conflicts of interest.'
          }
        ]
      }
    };
    return content[lessonId] || { title: 'Lesson Content', sections: [] };
  };

  const calculateQuizScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[`q${index}`] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fundamentals': return <BookOpen className="w-5 h-5" />;
      case 'techniques': return <Search className="w-5 h-5" />;
      case 'advanced': return <Brain className="w-5 h-5" />;
      case 'practice': return <Target className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Interactive Learning Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learn to Combat
            </span>
            <br />
            <span className="text-gray-900">Misinformation</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master the skills to identify, verify, and combat misinformation with our comprehensive 
            interactive learning platform featuring lessons, quizzes, and practical exercises.
          </p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{completedLessons.size}/{lessons.length}</h3>
                <p className="text-gray-600">Lessons Completed</p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedLessons.size / lessons.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{showQuizResults ? calculateQuizScore() : 0}%</h3>
                <p className="text-gray-600">Quiz Score</p>
              </div>
              <Target className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Expert</h3>
                <p className="text-gray-600">Skill Level</p>
              </div>
              <Brain className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-2xl p-1 mb-8">
          {[
            { id: 'lessons', label: 'Lessons', icon: BookOpen },
            { id: 'quiz', label: 'Knowledge Quiz', icon: CheckCircle },
            { id: 'practice', label: 'Practice Scenarios', icon: Target }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div>
            {selectedLesson ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                {(() => {
                  const content = getLessonContent(selectedLesson);
                  return (
                    <div>
                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        ← Back to Lessons
                      </button>
                      
                      <h2 className="text-3xl font-bold mb-6">{content.title}</h2>
                      
                      <div className="space-y-8">
                        {content.sections.map((section: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-6">
                            <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{section.content}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => completeLesson(selectedLesson)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                          <CheckCircle className="w-5 h-5 mr-2 inline" />
                          Complete Lesson
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedLesson(lesson.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        {getCategoryIcon(lesson.category)}
                      </div>
                      {lesson.completed && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      <span className="text-gray-500 text-sm">{lesson.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
            {!showQuizResults ? (
              <div>
                <h2 className="text-3xl font-bold mb-6">Knowledge Quiz</h2>
                <div className="space-y-8">
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optionIndex}
                              onChange={() => setQuizAnswers({...quizAnswers, [`q${index}`]: optionIndex})}
                              className="text-blue-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowQuizResults(true)}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold mb-6">Quiz Results</h2>
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-blue-600 mb-2">{calculateQuizScore()}%</div>
                  <p className="text-xl text-gray-600">Your Score</p>
                </div>
                
                <div className="space-y-6">
                  {quizQuestions.map((question, index) => {
                    const userAnswer = quizAnswers[`q${index}`];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className={`p-6 rounded-xl border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start space-x-3">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{question.question}</h4>
                            <p className="text-gray-700 mb-2">
                              <strong>Correct Answer:</strong> {question.options[question.correctAnswer]}
                            </p>
                            <p className="text-gray-600">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => {
                    setShowQuizResults(false);
                    setQuizAnswers({});
                  }}
                  className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Take Quiz Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-8">
            {practiceScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <h3 className="text-2xl font-bold mb-4">{scenario.title}</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Scenario:</h4>
                  <p className="text-yellow-700">{scenario.content}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Your Task:</h4>
                  <p className="text-blue-700">{scenario.task}</p>
                </div>
                
                <details className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <summary className="font-semibold text-gray-800 cursor-pointer hover:text-gray-600 flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Recommended Solution
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <ul className="space-y-2">
                      {scenario.solution.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
