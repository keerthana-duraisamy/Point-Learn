import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, saveEvaluation } from '../services/dbService';
import { generateQuiz, evaluateTask, evaluateProject, evaluateInterview, generateTask, generateProject, generateInterviewQuestions } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { Course, Lesson, QuizQuestion, Evaluation as EvaluationType, InterviewQuestion } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Brain, 
  Code, 
  Rocket, 
  Mic, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Square,
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type EvalType = 'quiz' | 'task' | 'project' | 'interview';

export default function Evaluation() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<EvalType>('quiz');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationType & { percentage?: number, correct?: number, wrong?: number } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Task State
  const [taskDetails, setTaskDetails] = useState<{
    title: string;
    description: string;
    implementation: string;
    conceptsUsed: string[];
  } | null>(null);
  const [taskCode, setTaskCode] = useState('');

  // Project State
  const [projectDetails, setProjectDetails] = useState<{
    title: string;
    problemStatement: string;
    whatToBuild: string;
    uiComponents: string[];
    concepts: string[];
    expectedOutput: string;
  } | null>(null);
  const [projectCode, setProjectCode] = useState('');

  // Interview State
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentInterviewIndex, setCurrentInterviewIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<number, string>>({});
  const [interviewResults, setInterviewResults] = useState<Record<number, { score: number, feedback: string }>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (courseId && lessonId && user) {
        try {
          const c = await getCourse(user.id, courseId);
          setCourse(c);
          const l = c?.lessons.find((l: any) => l.id === lessonId);
          setLesson(l || null);
          
          if (l && c) {
            // Use pre-generated data if available
            if (l.quiz && l.task && l.project && l.interviewQuestions) {
              setQuizQuestions(l.quiz);
              setTaskDetails(l.task);
              setProjectDetails(l.project);
              setInterviewQuestions(l.interviewQuestions);
            } else {
              // Fallback for older courses (deprecated but safe with gemini-2.5-flash and delay)
              const [questions, task, project, interview] = await Promise.all([
                generateQuiz(l.title, c.topic, l.videoTitle || l.title, l.concepts || l.description || ''),
                generateTask(l.title, c.topic, l.videoTitle || l.title, l.concepts || l.description || '', c.skillLevel),
                generateProject(l.title, c.topic, l.videoTitle || l.title, l.concepts || l.description || '', c.skillLevel),
                generateInterviewQuestions(l.title, c.topic, l.videoTitle || l.title, l.concepts || l.description || '')
              ]);
              setQuizQuestions(questions);
              setTaskDetails(task);
              setProjectDetails(project);
              setInterviewQuestions(interview);
            }
          }
        } catch (error) {
          console.error("Error fetching evaluation data:", error);
          // You could set an error state here to show to the user
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [courseId, lessonId, user]);

  const handleQuizSubmit = async () => {
    setSubmitting(true);
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) score++;
    });

    const percentage = (score / quizQuestions.length) * 100;
    const correct = score;
    const wrong = quizQuestions.length - score;
    let suggestion = '';
    if (percentage >= 80) suggestion = 'Excellent understanding of this topic!';
    else if (percentage >= 60) suggestion = 'Good understanding, but there is room for improvement.';
    else suggestion = 'You should review this topic again.';

    const evalData: Omit<EvaluationType, 'timestamp'> = {
      userId: user?.id || '',
      courseId: courseId!,
      lessonId: lessonId!,
      type: 'quiz',
      score: (score / quizQuestions.length) * 10,
      feedback: suggestion
    };

    await saveEvaluation(evalData);
    setResult({ ...evalData, timestamp: Date.now(), percentage, correct, wrong });
    setSubmitting(false);
  };

  const handleTaskSubmit = async () => {
    setSubmitting(true);
    const result = await evaluateTask(
      lesson?.title || '', 
      course?.topic || '', 
      lesson?.videoTitle || lesson?.title || '', 
      lesson?.concepts || lesson?.description || '', 
      taskCode
    );
    const evalData: Omit<EvaluationType, 'timestamp'> = {
      userId: user?.id || '',
      courseId: courseId!,
      lessonId: lessonId!,
      type: 'task',
      score: result.score,
      feedback: result.feedback
    };
    await saveEvaluation(evalData);
    setResult({ ...evalData, timestamp: Date.now() });
    setSubmitting(false);
  };

  const handleProjectSubmit = async () => {
    setSubmitting(true);
    const result = await evaluateProject(
      lesson?.title || '', 
      course?.topic || '', 
      lesson?.videoTitle || lesson?.title || '', 
      lesson?.concepts || lesson?.description || '', 
      projectCode
    );
    const evalData: Omit<EvaluationType, 'timestamp'> = {
      userId: user?.id || '',
      courseId: courseId!,
      lessonId: lessonId!,
      type: 'project',
      score: result.score,
      feedback: result.feedback
    };
    await saveEvaluation(evalData);
    setResult({ ...evalData, timestamp: Date.now() });
    setSubmitting(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        // In a real app, we'd send this to a STT service.
        // For this demo, we'll simulate a transcript.
        setTranscript("I believe that the core concept involves using efficient algorithms to solve complex problems by breaking them down into smaller, manageable sub-tasks.");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleInterviewSubmit = async () => {
    if (!transcript) return;
    setSubmitting(true);
    try {
      const currentQuestion = interviewQuestions[currentInterviewIndex];
      const result = await evaluateInterview(
        lesson?.title || '', 
        course?.topic || '', 
        lesson?.videoTitle || lesson?.title || '', 
        lesson?.concepts || lesson?.description || '', 
        transcript,
        currentQuestion.question,
        currentQuestion.idealAnswer
      );
      
      setInterviewResults({
        ...interviewResults,
        [currentInterviewIndex]: result
      });
      setInterviewAnswers({
        ...interviewAnswers,
        [currentInterviewIndex]: transcript
      });
    } catch (error) {
      console.error('Error evaluating interview:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalInterviewSubmit = async () => {
    setSubmitting(true);
    const resultsArray = Object.values(interviewResults) as { score: number, feedback: string, result?: string, matched_concepts?: string[], missing_concepts?: string[] }[];
    const totalScore = resultsArray.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = totalScore / interviewQuestions.length;
    
    const evalData: Omit<EvaluationType, 'timestamp'> = {
      userId: user?.id || '',
      courseId: courseId!,
      lessonId: lessonId!,
      type: 'interview',
      score: (avgScore / 3) * 10, // Normalize 0-3 score to 0-10
      feedback: `Interview completed. Overall Result: ${avgScore.toFixed(1)}/3. Check individual question feedback for details.`,
      result: resultsArray[0]?.result, // Store the first result as a sample or summary
      matched_concepts: resultsArray.flatMap(r => r.matched_concepts || []),
      missing_concepts: resultsArray.flatMap(r => r.missing_concepts || [])
    };
    await saveEvaluation(evalData);
    setResult({ ...evalData, timestamp: Date.now() });
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center space-y-8 py-12"
      >
        <div className="relative inline-block w-full">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative glass-dark p-12 rounded-[48px] border-white/10">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-white mb-2">Evaluation Complete!</h2>
            
            {result.type === 'quiz' ? (
              <div className="space-y-6 my-8">
                <div className="text-6xl font-black text-gradient">{result.correct}/{quizQuestions.length}</div>
                <div className="text-2xl font-bold text-white">{result.percentage}%</div>
                <div className="flex justify-center gap-8 text-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-6 h-6" /> {result.correct} Correct
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-6 h-6" /> {result.wrong} Wrong
                  </div>
                </div>
                <p className="text-slate-300 text-xl font-medium mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  {result.feedback}
                </p>

                {/* Detailed Quiz Results */}
                <div className="mt-12 space-y-6 text-left">
                  <h3 className="text-2xl font-black text-white px-2">Detailed Results</h3>
                  {quizQuestions.map((q, idx) => {
                    const userAnswer = quizAnswers[idx];
                    const isCorrect = userAnswer === q.correctIndex;
                    return (
                      <div key={idx} className={`p-6 rounded-[32px] border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} space-y-4`}>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-lg font-bold text-white">{idx + 1}. {q.question}</h4>
                          {isCorrect ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Answer</span>
                            <div className={`p-3 rounded-xl text-sm font-bold ${isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {q.options[userAnswer] !== undefined ? q.options[userAnswer] : 'No answer'}
                            </div>
                          </div>
                          {!isCorrect && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Correct Answer</span>
                              <div className="p-3 rounded-xl text-sm font-bold bg-green-500/10 text-green-400">
                                {q.options[q.correctIndex]}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="pt-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Explanation</span>
                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="text-6xl font-black text-gradient mb-6">{result.score.toFixed(1)}/10</div>
                <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                  {result.feedback}
                </p>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate(`/course/${courseId}`)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Path
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 transition-all uppercase tracking-widest text-xs"
              >
                Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Other Modules Navigation */}
            <div className="mt-12 pt-12 border-t border-white/10 space-y-6">
              <h3 className="text-xl font-black text-white">Try Other Modules</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['quiz', 'task', 'project', 'interview'].map((type) => {
                  if (type === result.type) return null;
                  
                  const isAvailable = 
                    (type === 'quiz' && lesson?.quiz) ||
                    (type === 'task' && lesson?.task) ||
                    (type === 'project' && lesson?.project) ||
                    (type === 'interview' && lesson?.interviewQuestions);
                  
                  if (!isAvailable) return null;

                  const icons = {
                    quiz: Brain,
                    task: Code,
                    project: Rocket,
                    interview: Mic
                  };
                  const Icon = icons[type as keyof typeof icons];

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setResult(null);
                        setActiveTab(type as EvalType);
                        window.scrollTo(0, 0);
                      }}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Course
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-black text-white uppercase tracking-widest">AI Evaluation Engine</span>
        </div>
      </div>

      <div className="glass-dark p-2 rounded-[32px] border-white/5 flex flex-wrap gap-2">
        {[
          { id: 'quiz', label: 'Quiz', icon: Brain },
          { id: 'task', label: 'Task', icon: Code },
          { id: 'project', label: 'Mini-Project', icon: Rocket },
          { id: 'interview', label: 'Interview', icon: Mic },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as EvalType)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-3xl font-black text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-dark p-8 sm:p-12 rounded-[48px] border-white/5 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white">Knowledge Check</h3>
                  <p className="text-slate-500 font-medium">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                </div>
                <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {quizQuestions.length > 0 ? (
                <div className="space-y-8">
                  <h4 className="text-xl font-bold text-white leading-relaxed">
                    {quizQuestions[currentQuestionIndex].question}
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuestionIndex]: idx })}
                        className={`p-6 rounded-3xl text-left font-bold transition-all border-2 ${
                          quizAnswers[currentQuestionIndex] === idx
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                            quizAnswers[currentQuestionIndex] === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          {option}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-between pt-8">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="btn-secondary disabled:opacity-30 w-full sm:w-auto justify-center"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Previous
                    </button>
                    {currentQuestionIndex === quizQuestions.length - 1 ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={submitting || quizAnswers[currentQuestionIndex] === undefined}
                        className="btn-primary w-full sm:w-auto justify-center"
                      >
                        {submitting ? 'Evaluating...' : 'Submit Quiz'}
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={quizAnswers[currentQuestionIndex] === undefined}
                        className="btn-primary w-full sm:w-auto justify-center"
                      >
                        Next Question
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-slate-500 font-bold">Generating your personalized quiz...</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'task' && (
            <motion.div
              key="task"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">{taskDetails?.title || 'Practical Task'}</h3>
                  <p className="text-slate-500 font-medium">Apply what you've learned in this module.</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
                  (taskDetails?.difficulty || course?.skillLevel) === 'Beginner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  (taskDetails?.difficulty || course?.skillLevel) === 'Intermediate' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {taskDetails?.difficulty || course?.skillLevel || 'Intermediate'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-[32px] border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-lg font-bold text-white mb-2">Task Description</h4>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {taskDetails?.description || `Implement a function that demonstrates the core concepts discussed in the "${lesson?.title}" lesson.`}
                  </p>
                </div>
                <div className="glass p-8 rounded-[32px] border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-lg font-bold text-white mb-2">Implementation Requirements</h4>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {taskDetails?.implementation}
                  </p>
                  {taskDetails?.conceptsUsed && (
                    <div className="pt-4">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Concepts Used</span>
                      <div className="flex flex-wrap gap-2">
                        {taskDetails.conceptsUsed.map((c, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-bold border border-blue-500/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2 overflow-hidden">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Solution Editor</label>
                    <span className="text-[10px] text-blue-400 font-bold truncate shrink-0">TypeScript / JavaScript</span>
                  </div>
                <textarea
                  value={taskCode}
                  onChange={(e) => setTaskCode(e.target.value)}
                  placeholder="// Write your code here..."
                  className="w-full h-64 bg-slate-950 text-blue-400 font-mono p-8 rounded-[32px] border border-white/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex justify-center md:justify-end">
                <button
                  onClick={handleTaskSubmit}
                  disabled={submitting || !taskCode.trim()}
                  className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
                >
                  {submitting ? 'AI is evaluating your code...' : 'Submit for Evaluation'}
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'project' && (
            <motion.div
              key="project"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">{projectDetails?.title || 'Mini-Project'}</h3>
                  <p className="text-slate-500 font-medium">Build a real-world application snippet.</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
                  (projectDetails?.difficulty || course?.skillLevel) === 'Beginner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  (projectDetails?.difficulty || course?.skillLevel) === 'Intermediate' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {projectDetails?.difficulty || course?.skillLevel || 'Advanced'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-[32px] border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    Project Details
                  </h4>
                  {projectDetails ? (
                    <div className="space-y-4 text-left">
                      <div>
                        <span className="text-white font-bold text-sm block mb-1">Problem Statement:</span>
                        <p className="text-slate-400 text-sm">{projectDetails.problemStatement}</p>
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block mb-1">What to Build:</span>
                        <p className="text-slate-400 text-sm">{projectDetails.whatToBuild}</p>
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block mb-1">Required UI Components:</span>
                        <ul className="text-slate-400 text-sm list-disc pl-4">
                          {projectDetails.uiComponents.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="text-white font-bold text-sm block mb-1">Required Concepts:</span>
                        <ul className="text-slate-400 text-sm list-disc pl-4">
                          {projectDetails.concepts.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <ul className="text-slate-400 text-sm space-y-3 list-disc pl-4">
                      <li>Create a modular implementation</li>
                      <li>Handle edge cases and errors</li>
                      <li>Ensure optimal performance</li>
                      <li>Follow industry best practices</li>
                    </ul>
                  )}
                </div>
                <div className="glass p-6 rounded-[32px] border-white/5 bg-white/5 space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Expected Output
                  </h4>
                  <p className="text-slate-400 text-sm italic">
                    {projectDetails ? projectDetails.expectedOutput : `"A fully functional component that manages state efficiently and provides a seamless user experience."`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Project Code</label>
                <textarea
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  placeholder="// Build your project here..."
                  className="w-full h-80 bg-slate-950 text-purple-400 font-mono p-8 rounded-[32px] border border-white/10 focus:border-purple-500 outline-none transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex justify-center md:justify-end">
                <button
                  onClick={handleProjectSubmit}
                  disabled={submitting || !projectCode.trim()}
                  className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
                >
                  {submitting ? 'AI is analyzing your project logic...' : 'Submit Project'}
                  <Rocket className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white">Interview Simulator</h3>
                  <p className="text-slate-500 font-medium">Question {currentInterviewIndex + 1} of {interviewQuestions.length}</p>
                </div>
                <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${((currentInterviewIndex + 1) / interviewQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {interviewQuestions.length > 0 ? (
                <div className="space-y-8">
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <h4 className="text-xl font-bold text-white leading-relaxed relative z-10">
                      {interviewQuestions[currentInterviewIndex].question}
                    </h4>
                  </div>

                  {!interviewResults[currentInterviewIndex] ? (
                    <div className="space-y-8">
                      <div className="relative py-8">
                        <div className={`absolute inset-0 bg-blue-500 blur-[80px] opacity-10 transition-opacity duration-1000 ${isRecording ? 'opacity-30' : ''}`}></div>
                        
                        <div className="relative flex flex-col items-center gap-6">
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                          }`}>
                            <Mic className="w-10 h-10 text-white" />
                          </div>

                          <div className="flex gap-4">
                            {!isRecording ? (
                              <button onClick={startRecording} className="btn-primary px-8 rounded-2xl">
                                <Play className="w-4 h-4" />
                                Start Recording
                              </button>
                            ) : (
                              <button onClick={stopRecording} className="btn-secondary px-8 rounded-2xl bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white">
                                <Square className="w-4 h-4" />
                                Stop Recording
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {audioUrl && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Response</span>
                            <button onClick={() => { setAudioUrl(null); setTranscript(''); }} className="text-[10px] font-bold text-red-400 hover:underline flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              Retake
                            </button>
                          </div>
                          <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-sm italic leading-relaxed">
                              "{transcript}"
                            </p>
                          </div>
                          <div className="flex justify-center md:justify-end w-full">
                            <button
                              onClick={handleInterviewSubmit}
                              disabled={submitting}
                              className="btn-primary w-full md:w-auto py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                              {submitting ? 'AI is evaluating...' : 'Evaluate Answer'}
                              <Sparkles className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-3xl border-white/5 bg-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{interviewResults[currentInterviewIndex].result || 'AI Feedback'}</span>
                            <span className="text-xl font-black text-white">{interviewResults[currentInterviewIndex].score}/3</span>
                          </div>
                          <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            {interviewResults[currentInterviewIndex].feedback}
                          </p>
                          {interviewResults[currentInterviewIndex].matched_concepts && interviewResults[currentInterviewIndex].matched_concepts.length > 0 && (
                            <div className="mb-3">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Matched Concepts</span>
                              <div className="flex flex-wrap gap-1">
                                {interviewResults[currentInterviewIndex].matched_concepts.map((c: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] font-bold border border-emerald-500/20">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {interviewResults[currentInterviewIndex].missing_concepts && interviewResults[currentInterviewIndex].missing_concepts.length > 0 && (
                            <div>
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Missing Concepts</span>
                              <div className="flex flex-wrap gap-1">
                                {interviewResults[currentInterviewIndex].missing_concepts.map((c: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md text-[9px] font-bold border border-red-500/20">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="glass p-6 rounded-3xl border-emerald-500/20 bg-emerald-500/5">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Exact Answer</span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            {interviewQuestions[currentInterviewIndex].idealAnswer}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        {currentInterviewIndex < interviewQuestions.length - 1 ? (
                          <button
                            onClick={() => {
                              setCurrentInterviewIndex(prev => prev + 1);
                              setAudioUrl(null);
                              setTranscript('');
                            }}
                            className="btn-primary px-10 rounded-2xl"
                          >
                            Next Question
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={handleFinalInterviewSubmit}
                            disabled={submitting}
                            className="btn-primary px-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 border-none"
                          >
                            {submitting ? 'Finalizing...' : 'Complete Interview'}
                            <Trophy className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-slate-500 font-bold">Preparing interview questions...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
