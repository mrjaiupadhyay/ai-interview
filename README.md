# AI Mock Interview

A modern, AI-powered mock interview application built with Next.js, React, and OpenAI. Practice your interview skills with personalized feedback.

## Features

- 🎯 **Customizable Interviews**: Choose your role, experience level, and interview type
- 🤖 **AI-Powered Questions**: Get relevant questions based on your profile
- 💬 **Interactive Session**: Real-time Q&A with the AI interviewer
- 📊 **Detailed Feedback**: Receive comprehensive feedback on your performance
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Setup**: Enter your job role, select experience level, interview type, and duration
2. **Interview**: Answer questions from the AI interviewer
3. **Review**: Get detailed feedback on your performance
4. **Improve**: Use the feedback to practice and improve

## Interview Types

- **Technical**: Focus on technical skills and problem-solving
- **Behavioral**: STAR method questions about past experiences
- **Mixed**: Combination of technical and behavioral questions
- **System Design**: Architecture and scalability discussions

## Tech Stack

- **Next.js 16**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **OpenAI GPT-4**: AI interview engine

## Project Structure

```
app/
  ├── api/
  │   └── interview/
  │       └── route.ts          # API endpoint for interview logic
  ├── components/
  │   ├── InterviewSetup.tsx    # Initial setup form
  │   ├── InterviewSession.tsx  # Interview interface
  │   └── InterviewResults.tsx  # Results and feedback display
  ├── page.tsx                   # Main page component
  ├── layout.tsx                 # Root layout
  └── globals.css                # Global styles
```

## License

MIT
