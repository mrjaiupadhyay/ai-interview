import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  return new Groq({ apiKey });
}

type InterviewConfig = {
  role: string;
  experienceLevel: string;
  interviewType: string;
  duration: number;
};

// Note: llama-3.3-70b-versatile and llama-3.1-8b-instant were deprecated by Groq
// (announced June 2026). Using a currently supported production model instead.
// See https://console.groq.com/docs/models for the up-to-date list.
const GROQ_MODEL = 'openai/gpt-oss-120b';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Groq API key is not configured. Please set GROQ_API_KEY in your .env.local file.',
        },
        { status: 500 }
      );
    }

    const groq = getGroqClient();

    const body = await request.json();

    const { action, config, messages } = body as {
      action: 'start' | 'continue' | 'end';
      config: InterviewConfig;
      messages?: Array<{
        role: 'user' | 'assistant';
        content: string;
      }>;
    };

    if (!config) {
      return NextResponse.json(
        { error: 'Config is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert interview coach conducting a mock interview for a ${config.experienceLevel} level ${config.role} position. The interview type is ${config.interviewType}.

Your role:
1. Ask relevant, challenging questions appropriate for the candidate's level.
2. Be professional but friendly.
3. Ask follow-up questions based on the candidate's answers.
4. After 4-5 questions or when the interview naturally concludes, provide comprehensive feedback.

Guidelines:
- For technical interviews: Ask about specific technologies, problem-solving, coding, and architecture.
- For behavioral interviews: Use STAR method questions (Situation, Task, Action, Result).
- For mixed interviews: Alternate between technical and behavioral questions.
- For system design: Focus on scalability, architecture, databases, APIs, and trade-offs.

Keep questions concise and clear.

After the interview, provide detailed feedback on:
- Strengths
- Areas for improvement
- Specific suggestions
- Overall performance rating (1-10)

When the interview should end after 4-5 questions, respond with:
INTERVIEW_COMPLETE

Then provide comprehensive feedback.`;

    // START INTERVIEW
    if (action === 'start') {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Start the interview. Begin with a greeting and your first question for a ${config.experienceLevel} level ${config.role} position.`,
          },
        ],
        temperature: 0.7,
      });

      const question =
        completion.choices[0]?.message?.content ||
        "Hello! Let's begin the interview.";

      return NextResponse.json({ question });
    }

    // CONTINUE INTERVIEW
    if (action === 'continue') {
      if (!messages || messages.length === 0) {
        return NextResponse.json(
          { error: 'Messages are required' },
          { status: 400 }
        );
      }

      const conversationMessages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...messages.map((msg) => ({
          role:
            msg.role === 'user'
              ? ('user' as const)
              : ('assistant' as const),
          content: msg.content,
        })),
      ];

      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: conversationMessages,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content || '';

      if (response.includes('INTERVIEW_COMPLETE')) {
        const feedback = response
          .replace('INTERVIEW_COMPLETE', '')
          .trim();

        return NextResponse.json({ feedback });
      }

      return NextResponse.json({
        question: response,
      });
    }

    // END INTERVIEW
    if (action === 'end') {
      if (!messages || messages.length === 0) {
        return NextResponse.json(
          { error: 'Messages are required' },
          { status: 400 }
        );
      }

      const conversationMessages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...messages.map((msg) => ({
          role:
            msg.role === 'user'
              ? ('user' as const)
              : ('assistant' as const),
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content:
            'The candidate has ended the interview early. Please provide comprehensive feedback on their performance based on the answers they gave.',
        },
      ];

      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: conversationMessages,
        temperature: 0.7,
      });

      const feedback =
        completion.choices[0]?.message?.content ||
        'Thank you for participating in the interview.';

      return NextResponse.json({ feedback });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Interview API error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to process interview request.',
        code: error?.code,
        status: error?.status,
      },
      {
        status: error?.status || 500,
      }
    );
  }
}
