'use client';

import { useState } from 'react';
import InterviewSetup from './components/InterviewSetup';
import InterviewSession from './components/InterviewSession';
import InterviewResults from './components/InterviewResults';

export type InterviewConfig = {
  role: string;
  experienceLevel: string;
  interviewType: string;
  duration: number;
};

export type InterviewState = {
  config: InterviewConfig | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isComplete: boolean;
  feedback: string | null;
};

export default function Home() {
  const [interviewState, setInterviewState] = useState<InterviewState>({
    config: null,
    messages: [],
    isComplete: false,
    feedback: null,
  });

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewState({
      config,
      messages: [],
      isComplete: false,
      feedback: null,
    });
  };

  const handleEndInterview = (messages: Array<{ role: 'user' | 'assistant'; content: string }>, feedback: string) => {
    setInterviewState(prev => ({
      ...prev,
      messages,
      isComplete: true,
      feedback,
    }));
  };

  const handleRestart = () => {
    setInterviewState({
      config: null,
      messages: [],
      isComplete: false,
      feedback: null,
    });
  };

  if (interviewState.isComplete && interviewState.feedback) {
    return (
      <InterviewResults
        config={interviewState.config!}
        messages={interviewState.messages}
        feedback={interviewState.feedback}
        onRestart={handleRestart}
      />
    );
  }

  if (interviewState.config) {
    return (
      <InterviewSession
        config={interviewState.config}
        onEndInterview={handleEndInterview}
        onBack={() => setInterviewState(prev => ({ ...prev, config: null }))}
      />
    );
  }

  return <InterviewSetup onStart={handleStartInterview} />;
}
