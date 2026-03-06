import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PromptInput from '../components/PromptInput';
import SecurityAnalysis from '../components/SecurityAnalysis';
import LLMResponse from '../components/LLMResponse';
import { sendPrompt } from '../services/api';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [showLLMResponse, setShowLLMResponse] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isAnalyzing, showLLMResponse]);

  const handleSend = async (prompt) => {
    // Reset states
    setCurrentPrompt(prompt);
    setCurrentResult(null);
    setShowLLMResponse(false);
    setIsAnalyzing(true);

    try {
      // Call the API
      const data = await sendPrompt(prompt);

      setCurrentResult(data);
    } catch (err) {
      console.error('Error:', err);
      setCurrentResult({
        prompt,
        label: 'ERROR',
        confidence: 0,
        riskScore: 0,
        action: 'BLOCKED',
        response: 'An error occurred while analyzing the prompt.',
      });
    }
  };

  const handleAnalysisComplete = () => {
    if (!currentResult) return;

    // Add the conversation entry
    const newEntry = {
      id: Date.now(),
      prompt: currentPrompt,
      ...currentResult,
    };

    setConversations((prev) => [...prev, newEntry]);
    setIsAnalyzing(false);

    // If allowed or sanitized, show LLM response with typing animation
    if (currentResult.action === 'ALLOWED' || currentResult.action === 'SANITIZED') {
      setIsLoadingLLM(true);
      setShowLLMResponse(true);

      // Short delay — response is already fetched
      setTimeout(() => {
        setIsLoadingLLM(false);
      }, 600);
    } else {
      // Blocked — show blocked LLM response
      setShowLLMResponse(true);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Message */}
          {conversations.length === 0 && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl mb-6"
              >
                🛡️
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">AI Firewall</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Every prompt is analyzed through multiple security layers before reaching the LLM.
                Watch the analysis in real-time!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                  <span className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-300 text-sm">Safe → Forwarded to LLM</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <span className="text-gray-300 text-sm">Suspicious → Sanitized</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                  <span className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-gray-300 text-sm">Malicious → Blocked</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Previous Conversations */}
          {conversations.map((entry) => (
            <div key={entry.id} className="space-y-4">
              {/* User Prompt */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-2xl rounded-tr-md shadow-lg">
                  <p>{entry.prompt}</p>
                </div>
              </motion.div>

              {/* Collapsed Analysis Result */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div
                  className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${
                    entry.action === 'ALLOWED'
                      ? 'border-green-500/30 bg-green-500/10'
                      : entry.action === 'SANITIZED'
                      ? 'border-yellow-500/30 bg-yellow-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <span>
                    {entry.action === 'ALLOWED' ? '✅' : entry.action === 'SANITIZED' ? '⚠️' : '🚫'}
                  </span>
                  <span
                    className={`font-semibold text-sm ${
                      entry.action === 'ALLOWED'
                        ? 'text-green-400'
                        : entry.action === 'SANITIZED'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-gray-500 text-xs">|</span>
                  <span className="text-gray-400 text-xs">{entry.label}</span>
                  <span className="text-gray-500 text-xs">|</span>
                  <span className="text-gray-400 text-xs">
                    Confidence: {Math.round(entry.confidence * 100)}%
                  </span>
                  <span className="text-gray-500 text-xs">|</span>
                  <span className="text-gray-400 text-xs">
                    Risk: {Math.round(entry.riskScore * 100)}%
                  </span>
                </div>
              </motion.div>

              {/* LLM Response (collapsed for history) */}
              {entry.response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-2xl bg-gray-800/60 border border-gray-700/50 rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <span className="text-gray-400 text-xs font-medium">LLM Response</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.response}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {/* Current Prompt Being Analyzed */}
          {isAnalyzing && currentPrompt && (
            <div className="space-y-4">
              {/* User Prompt */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-2xl rounded-tr-md shadow-lg">
                  <p>{currentPrompt}</p>
                </div>
              </motion.div>

              {/* Security Analysis Animation */}
              <SecurityAnalysis
                isAnalyzing={isAnalyzing}
                result={currentResult}
                onComplete={handleAnalysisComplete}
              />
            </div>
          )}

          {/* LLM Response for current prompt */}
          {showLLMResponse && !isAnalyzing && currentResult && (
            <LLMResponse
              response={currentResult.response}
              isLoading={isLoadingLLM}
              action={currentResult.action}
            />
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <PromptInput onSend={handleSend} isLoading={isAnalyzing || isLoadingLLM} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;