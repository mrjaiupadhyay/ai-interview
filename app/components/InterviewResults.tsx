'use client';

import type { InterviewConfig } from '../page';

interface InterviewResultsProps {
  config: InterviewConfig;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  feedback: string;
  onRestart: () => void;
}

export default function InterviewResults({ config, messages, feedback, onRestart }: InterviewResultsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Complete! 🎉
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Here's your detailed feedback
            </p>
          </div>

          {/* Interview Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interview Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{config.role}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Level:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {config.experienceLevel.charAt(0).toUpperCase() + config.experienceLevel.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {config.interviewType.charAt(0).toUpperCase() + config.interviewType.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Questions Answered:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {messages.filter(m => m.role === 'assistant').length}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Feedback</h2>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {feedback}
              </div>
            </div>
          </div>

          {/* Conversation Review */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Conversation Review</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
