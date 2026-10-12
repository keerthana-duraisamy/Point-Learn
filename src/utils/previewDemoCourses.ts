import { Course } from '../types';

export const SAMPLE_PREVIEW_COURSES: Course[] = [
  {
    id: 'demo-course-react-fullstack',
    userId: 'preview-demo-user',
    topic: 'Full-Stack React & Modern Web Architecture',
    skillLevel: 'Intermediate',
    progress: 50,
    completedLessons: [0],
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'lesson-1-react-fundamentals',
        title: 'React Components, State & Hooks Deep Dive',
        videoId: 'bMknfKXIFA8',
        videoTitle: 'React Course 2024 - Beginner to Advanced',
        embedUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
        completed: true,
        startTime: 0,
        endTime: 600,
        description: 'Understand the core mental model of React components, state reconciliation, and standard hooks.',
        difficulty: 'Intermediate',
        quiz: [
          {
            question: 'What is the primary benefit of React hooks?',
            options: [
              'They eliminate the need for JavaScript',
              'They let you use state and lifecycle features in function components',
              'They speed up CSS rendering only',
              'They force synchronous state mutation'
            ],
            correctIndex: 1,
            explanation: 'Hooks allow function components to access state and lifecycle features without writing class components.'
          },
          {
            question: 'When does useEffect run by default if no dependency array is passed?',
            options: [
              'Only on initial mount',
              'After every single render',
              'Never',
              'Only when state changes'
            ],
            correctIndex: 1,
            explanation: 'Without a dependency array, useEffect executes after initial mount and after every subsequent re-render.'
          }
        ],
        task: {
          title: 'Implement an Optimistic State Hook',
          description: 'Build a custom hook that manages immediate local UI update while persisting to an asynchronous API in the background.',
          implementation: 'useOptimisticUpdate hook handling rollback upon failure.',
          conceptsUsed: ['React Hooks', 'Asynchronous Operations', 'Error Rollback'],
          difficulty: 'Intermediate'
        },
        interviewQuestions: [
          {
            question: 'Explain the Virtual DOM and reconciliation process in React.',
            idealAnswer: 'React maintains a lightweight virtual DOM tree in memory. When state updates occur, it computes differences via the diffing algorithm (Fiber architecture) and applies batched minimal updates to the real DOM.'
          }
        ]
      },
      {
        id: 'lesson-2-async-state',
        title: 'Server State Management & Data Fetching Patterns',
        videoId: 'vyJU93wpq2c',
        videoTitle: 'Modern Data Fetching & Caching Strategies',
        embedUrl: 'https://www.youtube.com/embed/vyJU93wpq2c',
        completed: false,
        startTime: 0,
        endTime: 750,
        description: 'Explore caching, invalidation, mutation workflows, and resilient error boundaries in client-server apps.',
        difficulty: 'Advanced',
        quiz: [
          {
            question: 'Why separate server cache state from local UI state?',
            options: [
              'Server state is asynchronous, remotely owned, and needs background revalidation',
              'To make the bundle size larger',
              'Because functions cannot store objects',
              'It has no benefits'
            ],
            correctIndex: 0,
            explanation: 'Server state has different lifecycle requirements like stale-while-revalidate, deduplication, and synchronization.'
          }
        ],
        task: {
          title: 'Build a Resilient Retry Fetch Handler',
          description: 'Create an exponential backoff fetching wrapper for flaky networks.',
          implementation: 'fetchWithRetry helper function.',
          conceptsUsed: ['Promises', 'Exponential Backoff', 'Network Resiliency'],
          difficulty: 'Intermediate'
        },
        interviewQuestions: [
          {
            question: 'How do you prevent race conditions when handling multiple search queries?',
            idealAnswer: 'Using AbortController to cancel superseded requests or tracking active sequence IDs so earlier delayed responses do not overwrite newer state.'
          }
        ]
      }
    ]
  },
  {
    id: 'demo-course-ml-foundations',
    userId: 'preview-demo-user',
    topic: 'Machine Learning & Neural Network Foundations',
    skillLevel: 'Beginner',
    progress: 25,
    completedLessons: [],
    createdAt: new Date().toISOString(),
    lessons: [
      {
        id: 'lesson-1-intro-ml',
        title: 'Supervised vs. Unsupervised Learning & Core Metrics',
        videoId: 'i_LwzRVP7bg',
        videoTitle: 'Machine Learning for Everyone',
        embedUrl: 'https://www.youtube.com/embed/i_LwzRVP7bg',
        completed: false,
        startTime: 0,
        endTime: 900,
        description: 'Learn foundational concepts of features, target labels, training splits, and evaluation metrics.',
        difficulty: 'Beginner',
        quiz: [
          {
            question: 'What characterizes supervised learning?',
            options: [
              'Data has known input-output ground truth labels',
              'Data has no labels and is only clustered',
              'The algorithm cannot be tested',
              'Only robots can run the code'
            ],
            correctIndex: 0,
            explanation: 'Supervised learning trains on pairs of inputs and corresponding target labels.'
          }
        ],
        task: {
          title: 'Calculate Precision and Recall Matrix',
          description: 'Compute classification metrics from a simulated confusion matrix.',
          implementation: 'evaluateClassifierMetrics function.',
          conceptsUsed: ['True Positives', 'Precision', 'Recall', 'F1-Score'],
          difficulty: 'Beginner'
        },
        interviewQuestions: [
          {
            question: 'What is overfitting and how do you mitigate it?',
            idealAnswer: 'Overfitting occurs when a model memorizes noise in the training data rather than generalizing. Mitigate with regularization (L1/L2), dropout, cross-validation, and more training data.'
          }
        ]
      }
    ]
  }
];
