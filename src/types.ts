export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  videoTitle?: string;
  concepts?: string;
  embedUrl: string;
  fallbackVideoIds?: string[];
  startTime?: number;
  endTime?: number;
  completed: boolean;
  description?: string;
  difficulty?: string;
  quiz?: QuizQuestion[];
  task?: {
    title: string;
    description: string;
    implementation: string;
    conceptsUsed: string[];
    difficulty: string;
  };
  project?: {
    title: string;
    difficulty: string;
    problemStatement: string;
    whatToBuild: string;
    uiComponents: string[];
    concepts: string[];
    expectedOutput: string;
  };
  interviewQuestions?: InterviewQuestion[];
}

export interface Course {
  id: string;
  userId: string;
  topic: string;
  skillLevel: string;
  lessons: Lesson[];
  createdAt: any;
  completedLessons: number[];
  progress: number;
}

export interface Evaluation {
  userId: string;
  courseId: string;
  lessonId: string;
  type: 'quiz' | 'task' | 'project' | 'interview';
  score: number;
  feedback: string;
  timestamp: any;
  result?: string;
  matched_concepts?: string[];
  missing_concepts?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface InterviewQuestion {
  question: string;
  idealAnswer: string;
}
