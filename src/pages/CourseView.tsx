import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, markLessonCompleted } from '../services/dbService';
import { Course, Lesson } from '../types';
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Maximize2, 
  Sparkles,
  Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import YouTubePlayer from '../components/YouTubePlayer';

import { useAuth } from '../contexts/AuthContext';

export default function CourseView() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId && user) {
        const data = await getCourse(user.id, courseId);
        setCourse(data);
        if (data && data.lessons.length > 0) {
          setActiveLesson(data.lessons[0]);
        }
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, user]);

  const handleComplete = async () => {
    if (courseId && activeLesson && user) {
      await markLessonCompleted(user.id, courseId, activeLesson.id);
      // Refresh course data
      const data = await getCourse(user.id, courseId);
      setCourse(data);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!course) return (
    <div className="text-center py-20 glass rounded-3xl">
      <h2 className="text-2xl font-bold text-white">Course not found.</h2>
      <Link to="/" className="text-blue-400 mt-4 inline-block font-bold">Return to Dashboard</Link>
    </div>
  );

  const progressPercent = course.progress || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Your Progress</div>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full shadow-lg shadow-blue-500/20"
                ></motion.div>
              </div>
              <span className="text-lg font-black text-blue-400">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Lesson List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-dark p-6 rounded-[32px] border-white/5">
            <h1 className="text-2xl font-black text-white mb-2 leading-tight">{course.topic}</h1>
            <div className="space-y-4 mb-6">
              <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-black uppercase tracking-widest">
                  {course.skillLevel}
                </span>
                • {course.lessons.length} Modules
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Course Progress</span>
                  <span className="text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left border ${
                    activeLesson?.id === lesson.id 
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-xs ${
                    lesson.completed 
                      ? 'bg-green-500 text-white' 
                      : activeLesson?.id === lesson.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'
                  }`}>
                    {lesson.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-400'}`}>
                      {lesson.title}
                    </h3>
                    {lesson.completed && (
                      <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Completed</div>
                    )}
                  </div>
                  {activeLesson?.id === lesson.id && (
                    <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Video Player */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeLesson && (
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className={`relative group rounded-[40px] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none bg-black' : 'aspect-video'}`}>
                  <YouTubePlayer 
                    videoId={activeLesson.videoId || 'bMknfKXIFA8'} 
                    fallbackVideoIds={activeLesson.fallbackVideoIds} 
                    title={activeLesson.videoTitle || activeLesson.title} 
                    startTime={activeLesson.startTime}
                    endTime={activeLesson.endTime}
                  />
                  
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute bottom-6 right-6 p-3 bg-black/50 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="glass-dark p-8 rounded-[40px] border-white/5 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-white">{activeLesson.title}</h2>
                      <p className="text-slate-400 font-medium max-w-xl">
                        {activeLesson.description || "Master the core concepts of this module through guided video instruction and AI-powered evaluation."}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center sm:justify-end items-center">
                      {!activeLesson.completed && (
                        <button
                          onClick={handleComplete}
                          className="btn-secondary w-full sm:w-auto justify-center"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Done
                        </button>
                      )}
                      <Link
                        to={`/course/${course.id}/lesson/${activeLesson.id}/evaluate`}
                        className="btn-primary w-full sm:w-auto justify-center"
                      >
                        <Sparkles className="w-5 h-5" />
                        Evaluate
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
