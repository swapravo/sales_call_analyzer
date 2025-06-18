// File: pages/transcriptions.js
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PhoneCall, BarChart2, FileText, Shield, ArrowRight, TrendingUp, MessageCircle, Volume2, Zap, AlertCircle, Target, CheckCircle, XCircle, Lightbulb, Info } from 'lucide-react';
import Header from './components/header';
import Footer from './components/footer';

// Analysis Card Component - Updated for text-based content
const AnalysisCard = ({ title, icon: Icon, detail, positive, negative, suggestions, score, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {score && (
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium text-gray-600">Score: </span>
              <span className={`ml-1 px-2 py-1 text-xs font-bold rounded ${
                score >= 8 ? 'bg-green-100 text-green-800' :
                score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {score}/10
              </span>
            </div>
          )}
        </div>
      </div>
      
      {detail && (
        <div className="mb-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Analysis</span>
              <p className="text-gray-700 text-sm leading-relaxed mt-1">{detail}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {positive && (
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Positive Examples</span>
              <p className="text-sm text-gray-700 mt-1">{positive}</p>
            </div>
          </div>
        )}
        
        {negative && (
          <div className="flex items-start space-x-2">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Areas to Address</span>
              <p className="text-sm text-gray-700 mt-1">{negative}</p>
            </div>
          </div>
        )}
        
        {suggestions && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-800">Suggestions</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{suggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Overall Summary Component
const OverallSummary = ({ overallScore, strengths, areasForImprovement }) => {
  if (!overallScore && !strengths && !areasForImprovement) return null;
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white bg-opacity-20">
            <BarChart2 className="h-6 w-6 text-black" />
          </div>
          <h3 className="text-xl font-semibold">Overall Assessment</h3>
        </div>
        {overallScore && (
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-black opacity-90">Overall Score</span>
            <div className="text-2xl font-bold text-black">{overallScore}/10</div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {strengths && (
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Key Strengths
            </h4>
            <p className="text-white text-opacity-90 leading-relaxed">{strengths}</p>
          </div>
        )}
        
        {areasForImprovement && (
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Areas for Improvement
            </h4>
            <p className="text-white text-opacity-90 leading-relaxed">{areasForImprovement}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Transcriptions() {
  const router = useRouter();
  const [data, setData] = useState({ headers: [], table_data: [] });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    // Run only once on mount: parse URL and set page
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    setPage(currentPage);
  }, []);

  useEffect(() => {
    setLoading(true);

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transcriptions?page=${page}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        console.log("[Transcriptions Fetched]:", json);
      })
      .catch(err => {
        console.error("Failed to fetch transcriptions:", err);
        setLoading(false);
      });
  }, [page]);

  const goToPage = (newPage) => {
    router.push(`/transcriptions?page=${newPage}`);
    setPage(newPage);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Helper function to get data by header name
  const getDataByHeader = (row, headerName) => {
    const headerIndex = data.headers.findIndex(h => h.toLowerCase() === headerName.toLowerCase());
    return headerIndex !== -1 ? row[headerIndex] : null;
  };

  // Helper function to check if a field has meaningful content
  const hasContent = (value) => {
    return value && value.toString().trim() !== '' && value.toString().toLowerCase() !== 'null' && value.toString().toLowerCase() !== 'undefined';
  };

  // Format date/time helper
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === 'null' || dateTimeString === 'undefined') return '-';

    try {
      // Convert SQL datetime ("YYYY-MM-DD HH:mm:ss") to ISO format ("YYYY-MM-DDTHH:mm:ss")
      const isoString = dateTimeString.replace(' ', 'T');
      const date = new Date(isoString);

      if (isNaN(date.getTime())) return dateTimeString; // Return original if invalid date

      const formatted = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      console.log(`[formatDateTime] Input: "${dateTimeString}" → Formatted: "${formatted}"`);
      return formatted;

    } catch (error) {
      console.log(`[formatDateTime] Error parsing: "${dateTimeString}"`, error);
      return dateTimeString; // Return original if error
    }
  };

  // Define the basic table columns we want to display
  const basicTableConfig = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'time', label: 'Time', formatter: formatDateTime }
  ];

  // Get basic table data for display
  const getBasicRowData = (row) => {
    return basicTableConfig.map(config => {
      const value = getDataByHeader(row, config.key);
      console.log(`[getBasicRowData] Key: "${config.key}" → Value: "${value}"`);
      return config.formatter ? config.formatter(value) : (value || '-');
    });
  };

  // Get analysis data for a specific row - Updated to match actual database column names
  const getAnalysisData = (row) => {
    return {
      pitch: {
        detail: getDataByHeader(row, 'pitch_followed_analysis'),
        positive: getDataByHeader(row, 'pitch_followed_positive_example'),
        negative: getDataByHeader(row, 'pitch_followed_negative_example'),
        suggestions: getDataByHeader(row, 'pitch_followed_suggestions'),
        score: getDataByHeader(row, 'pitch_followed_score')
      },
      confidence: {
        detail: getDataByHeader(row, 'confidence_analysis'),
        positive: getDataByHeader(row, 'confidence_positive_example'),
        negative: getDataByHeader(row, 'confidence_negative_example'),
        suggestions: getDataByHeader(row, 'confidence_suggestions'),
        score: getDataByHeader(row, 'confidence_score')
      },
      tonality: {
        detail: getDataByHeader(row, 'tonality_analysis'),
        positive: getDataByHeader(row, 'tonality_positive_example'),
        negative: getDataByHeader(row, 'tonality_negative_example'),
        suggestions: getDataByHeader(row, 'tonality_suggestions'),
        score: getDataByHeader(row, 'tonality_score')
      },
      energy: {
        detail: getDataByHeader(row, 'energy_analysis'),
        positive: getDataByHeader(row, 'energy_positive_example'),
        negative: getDataByHeader(row, 'energy_negative_example'),
        suggestions: getDataByHeader(row, 'energy_suggestions'),
        score: getDataByHeader(row, 'energy_score')
      },
      objection: {
        detail: getDataByHeader(row, 'objection_handling_analysis'),
        positive: getDataByHeader(row, 'objection_handling_positive_example'),
        negative: getDataByHeader(row, 'objection_handling_negative_example'),
        suggestions: getDataByHeader(row, 'objection_handling_suggestions'),
        score: getDataByHeader(row, 'objection_handling_score')
      },
      strengths: getDataByHeader(row, 'strengths'),
      areasForImprovement: getDataByHeader(row, 'areas_for_improvement'),
      overallScore: getDataByHeader(row, 'overall_score'),
      transcription: getDataByHeader(row, 'transcription')
    };
  };

  // Check if analysis data exists for a row
  const hasAnalysisData = (row) => {
    const analysisData = getAnalysisData(row);
    return Object.values(analysisData).some(section => {
      if (typeof section === 'object' && section !== null) {
        return Object.values(section).some(value => hasContent(value));
      }
      return hasContent(section);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Head>
        <title>Sales Call Analyzer | Transcription</title>
        <meta name="description" content="Upload, transcribe, and analyze your sales calls with advanced AI analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Audio Transcriptions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            View and manage your audio transcription history with detailed analysis and feedback
          </p>
        </div>

        {/* Basic Information Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Transcription Records</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                <div className="space-y-4">
                  <div className="h-4 w-36 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
                  <div className="h-4 w-24 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
                    <tr>
                      {basicTableConfig.map((config, idx) => (
                        <th 
                          key={idx} 
                          className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {config.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.table_data.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        className="hover:bg-indigo-50 transition duration-200"
                      >
                        {getBasicRowData(row).map((cell, cellIndex) => (
                          <td 
                            key={cellIndex} 
                            className="px-6 py-4 text-sm text-gray-700 text-center"
                          >
                            <div className="max-w-xs truncate" title={cell}>
                              {cell}
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm text-center">
                          {hasAnalysisData(row) ? (
                            <button
                              onClick={() => setSelectedRow(selectedRow === rowIndex ? null : rowIndex)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200"
                            >
                              {selectedRow === rowIndex ? 'Hide Analysis' : 'View Analysis'}
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">No analysis available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.table_data.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No transcriptions found</p>
                  <p className="text-gray-500 text-sm mt-2">Upload some audio files to get started</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analysis Section */}
        {selectedRow !== null && data.table_data[selectedRow] && hasAnalysisData(data.table_data[selectedRow]) && (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Call Analysis & Feedback</h2>
              <p className="text-gray-600 mt-2">Detailed analysis and recommendations for this sales call</p>
            </div>

            {(() => {
              const analysisData = getAnalysisData(data.table_data[selectedRow]);
              
              return (
                <>
                  {/* Overall Assessment */}
                  <OverallSummary 
                    overallScore={analysisData.overallScore}
                    strengths={analysisData.strengths}
                    areasForImprovement={analysisData.areasForImprovement}
                  />

                  {/* Transcription Section */}
                  {hasContent(analysisData.transcription) && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Call Transcription</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysisData.transcription}</p>
                      </div>
                    </div>
                  )}

                  {/* Analysis Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {(hasContent(analysisData.pitch.detail) || hasContent(analysisData.pitch.positive) || hasContent(analysisData.pitch.negative) || hasContent(analysisData.pitch.suggestions) || analysisData.pitch.score) && (
                      <AnalysisCard
                        title="Pitch Quality"
                        icon={Target}
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                        {...analysisData.pitch}
                      />
                    )}
                    
                    {(hasContent(analysisData.confidence.detail) || hasContent(analysisData.confidence.positive) || hasContent(analysisData.confidence.negative) || hasContent(analysisData.confidence.suggestions) || analysisData.confidence.score) && (
                      <AnalysisCard
                        title="Confidence Level"
                        icon={TrendingUp}
                        color="bg-gradient-to-r from-green-500 to-green-600"
                        {...analysisData.confidence}
                      />
                    )}
                    
                    {(hasContent(analysisData.tonality.detail) || hasContent(analysisData.tonality.positive) || hasContent(analysisData.tonality.negative) || hasContent(analysisData.tonality.suggestions) || analysisData.tonality.score) && (
                      <AnalysisCard
                        title="Tonality"
                        icon={MessageCircle}
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                        {...analysisData.tonality}
                      />
                    )}
                    
                    {(hasContent(analysisData.energy.detail) || hasContent(analysisData.energy.positive) || hasContent(analysisData.energy.negative) || hasContent(analysisData.energy.suggestions) || analysisData.energy.score) && (
                      <AnalysisCard
                        title="Energy Level"
                        icon={Zap}
                        color="bg-gradient-to-r from-yellow-500 to-orange-500"
                        {...analysisData.energy}
                      />
                    )}
                    
                    {(hasContent(analysisData.objection.detail) || hasContent(analysisData.objection.positive) || hasContent(analysisData.objection.negative) || hasContent(analysisData.objection.suggestions) || analysisData.objection.score) && (
                      <AnalysisCard
                        title="Objection Handling"
                        icon={AlertCircle}
                        color="bg-gradient-to-r from-red-500 to-red-600"
                        {...analysisData.objection}
                      />
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          {page > 1 && (
            <button
              onClick={() => goToPage(page - 1)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Previous
            </button>
          )}
          
          <div className="px-4 py-2 rounded-lg border border-gray-200 bg-white">
            <p className="font-medium text-gray-700">Page {page}</p>
          </div>
          
          <button
            onClick={() => goToPage(page + 1)}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}