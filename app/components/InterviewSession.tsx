'use client';

import { useState, useEffect, useRef } from 'react';
import type { InterviewConfig } from '../page';

interface InterviewSessionProps {
  config: InterviewConfig;
  onEndInterview: (messages: Array<{ role: 'user' | 'assistant'; content: string }>, feedback: string) => void;
  onBack: () => void;
}

export default function InterviewSession({ config, onEndInterview, onBack }: InterviewSessionProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [startTime] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    setIsInterviewStarted(true);
    
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const data = await response.json();
      if (data.question) {
        setMessages([{ role: 'assistant', content: data.question }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview. Please check your OpenAI API key in .env.local';
      alert(errorMessage);
      setIsInterviewStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: currentAnswer };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentAnswer('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'continue',
          config,
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      const data = await response.json();
      
      if (data.feedback) {
        // Interview is complete
        onEndInterview(newMessages, data.feedback);
      } else if (data.question) {
        setMessages([...newMessages, { role: 'assistant', content: data.question }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    if (!confirm('Are you sure you want to end the interview?')) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          config,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end interview');
      }

      const data = await response.json();
      if (data.feedback) {
        onEndInterview(messages, data.feedback);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to end interview. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Start?
                </h2>
                <div className="space-y-2 text-left max-w-md mx-auto">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Role:</strong> {config.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Level:</strong> {config.experienceLevel.charAt(0).toUpperCase() + config.experienceLevel.slice(1)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Type:</strong> {config.interviewType.charAt(0).toUpperCase() + config.interviewType.slice(1)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Duration:</strong> {config.duration} minutes
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={startInterview}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Starting...' : 'Start Interview'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{config.role}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.interviewType.charAt(0).toUpperCase() + config.interviewType.slice(1)} Interview
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Elapsed</div>
                <div className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                  {formatTime(Date.now() - startTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700 min-h-[400px] max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                Waiting for first question...
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Answer
            </label>
            <textarea
              id="answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  submitAnswer();
                }
              }}
              placeholder="Type your answer here... (Cmd/Ctrl + Enter to submit)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              disabled={isLoading}
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Submit Answer'}
              </button>
              <button
                onClick={endInterview}
                disabled={isLoading}
                className="px-6 py-3 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
