import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, markLessonCompleted } from '../services/dbService';
import { Course, Lesson } from '../types';
import { ChevronLeft, Play, CheckCircle, ArrowRight, Sparkles, Clock, BookOpen, Layout, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import YouTubePlayer from '../components/YouTubePlayer';

import { useAuth } from '../contexts/AuthContext';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId && lessonId && user) {
        const data = await getCourse(user.id, courseId);
        setCourse(data);
        const currentLesson = data?.lessons.find((l: any) => l.id === lessonId);
        setLesson(currentLesson);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, lessonId, user]);

  const handleComplete = async () => {
    if (courseId && lessonId && user) {
      await markLessonCompleted(user.id, courseId, lessonId);
      navigate(`/course/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson || !course) return <div className="text-center py-20 text-slate-500 font-bold">Lesson not found.</div>;

  const lessonIndex = course.lessons.findIndex((l: any) => l.id === lessonId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-4">
          <Link 
            to={`/course/${courseId}`} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 text-sm font-black uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Path
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{lesson.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Progress</div>
            <div className="text-lg font-black text-white">Lesson {lessonIndex + 1} of {course.lessons.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layout className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="space-y-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative aspect-video bg-[#0A0A0B] rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
            <YouTubePlayer 
              videoId={lesson.videoId || 'bMknfKXIFA8'} 
              fallbackVideoIds={lesson.fallbackVideoIds} 
              title={lesson.videoTitle || lesson.title} 
              startTime={lesson.startTime}
              endTime={lesson.endTime}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="glass-dark p-8 rounded-[40px] border-white/10 flex flex-col lg:flex-row gap-8 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Ready for evaluation?</h3>
              <p className="text-slate-500 font-bold">Test your knowledge with AI-powered quizzes and tasks.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto justify-center lg:justify-end items-center">
            <button
              onClick={handleComplete}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-300 font-black rounded-[24px] border border-white/10 transition-all uppercase tracking-widest text-xs"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Done
            </button>
            <Link
              to={`/course/${courseId}/lesson/${lessonId}/evaluate`}
              className="btn-primary w-full sm:w-auto px-12 py-5 rounded-[24px] shadow-xl shadow-blue-600/20 justify-center"
            >
              <Sparkles className="w-5 h-5" />
              Evaluate Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-[32px] border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs">
            <Clock className="w-4 h-4" />
            Difficulty
          </div>
          <p className="text-2xl font-black text-white">{lesson.difficulty || 'Intermediate'}</p>
        </div>
        <div className="md:col-span-2 glass p-8 rounded-[32px] border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-xs">
            <BookOpen className="w-4 h-4" />
            Description
          </div>
          <p className="text-slate-400 font-bold leading-relaxed">
            {lesson.description || 'In this lesson, you will master the core concepts through a curated video tutorial and follow-up AI evaluations.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
