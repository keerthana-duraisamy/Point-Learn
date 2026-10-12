import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateCourseStructure } from '../services/geminiService';
import { resolveLessonEmbed } from '../services/youtubeService';
import { saveCourse, getUserCourses, deleteCourse } from '../services/dbService';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Sparkles, BookOpen, ChevronRight, Clock, Zap, GraduationCap, TrendingUp, Users, Award, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [topic, setTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        const userCourses = await getUserCourses(user.id);
        setCourses(userCourses);
      }
    };
    fetchCourses();
  }, [user]);

  const handleDeleteCourse = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && window.confirm('Are you sure you want to delete this learning path?')) {
      try {
        await deleteCourse(user.id, id);
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleClearAll = async () => {
    if (user && window.confirm('Are you sure you want to delete ALL learning paths? This cannot be undone.')) {
      try {
        for (const course of courses) {
          await deleteCourse(user.id, course.id);
        }
        setCourses([]);
      } catch (error) {
        console.error('Error clearing courses:', error);
      }
    }
  };

  const overallProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length) 
    : 0;

  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setLoadingStatus('Generating course structure with AI...');
    try {
      const structure = await generateCourseStructure(topic, skillLevel);
      
      setLoadingStatus('Fetching relevant YouTube video tutorials for each topic...');
      const lessons = [];
      for (let i = 0; i < structure.length; i++) {
        const item = structure[i];
        setLoadingStatus(`Matching YouTube tutorial for Module ${i + 1}: ${item.title}...`);

        const videoResolution = await resolveLessonEmbed(
          topic,
          item.title,
          i,
          item.youtubeSearchQuery || `${topic} ${item.title} tutorial`,
          item.startTime || 0,
          item.endTime || 0
        );

        lessons.push({
          id: Math.random().toString(36).substr(2, 9),
          title: item.title,
          videoId: videoResolution.videoId,
          videoTitle: videoResolution.videoTitle,
          concepts: item.concepts,
          embedUrl: videoResolution.embedUrl,
          startTime: item.startTime || 0,
          endTime: item.endTime || 0,
          fallbackVideoIds: videoResolution.fallbackVideoIds,
          completed: false,
          description: item.description,
          difficulty: item.difficulty,
          quiz: item.quiz,
          task: item.task,
          project: item.project,
          interviewQuestions: item.interviewQuestions
        });
      }

      const courseId = await saveCourse({
        userId: user?.id || '',
        topic,
        skillLevel,
        lessons
      });

      navigate(`/course/${courseId}`);
    } catch (error: any) {
      console.error('Error generating course:', error);
      alert(error.message || 'Failed to generate course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Learners', value: '12K+', icon: Users, color: 'text-blue-400' },
    { label: 'Courses Created', value: '45K+', icon: BookOpen, color: 'text-purple-400' },
    { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Certificates', value: '8.5K', icon: Award, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-5xl mx-auto space-y-10 relative"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black tracking-widest uppercase mb-4 shadow-lg shadow-blue-500/5">
          <Zap className="w-4 h-4 fill-current" />
          The Future of Learning is Here
        </div>
        
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-6">
          Master Any <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">Skill Instantly</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-bold leading-relaxed">
          Unlock your potential with AI-curated learning paths. 
          Real-world projects, expert videos, and instant feedback.
        </p>
        
        <form onSubmit={handleGenerateCourse} className="flex flex-col sm:flex-row gap-4 glass-dark p-4 rounded-[40px] shadow-2xl border-white/10 max-w-3xl mx-auto relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
            <input
              type="text"
              placeholder="What do you want to master today?"
              className="w-full pl-16 pr-6 py-5 bg-transparent outline-none text-white text-xl font-bold placeholder:text-slate-700"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select 
                className="w-full h-full px-8 py-5 bg-white/5 rounded-[28px] outline-none text-slate-300 font-black border border-white/10 focus:border-blue-500 transition-all cursor-pointer appearance-none hover:bg-white/10"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                disabled={loading}
              >
                <option className="bg-slate-900">Beginner</option>
                <option className="bg-slate-900">Intermediate</option>
                <option className="bg-slate-900">Advanced</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !topic}
              className="btn-primary px-12 py-5 rounded-[28px] shadow-xl shadow-blue-600/20 w-full sm:w-auto justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-black text-white/80 animate-pulse">{loadingStatus}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span className="hidden sm:inline">Generate Path</span>
                  <span className="sm:hidden">Go</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center gap-3"
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* My Courses Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              My Learning Paths
            </h2>
            <p className="text-slate-500 font-bold ml-16">Continue where you left off or start something new.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {courses.length > 0 && (
              <>
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-sm font-black text-red-400 transition-all border border-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
                <Link 
                  to="/progress"
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[24px] text-sm font-black shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  <TrendingUp className="w-5 h-5" />
                  Overall Progress: {overallProgress}%
                </Link>
              </>
            )}
          </div>
        </div>

        {courses.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 glass-dark rounded-[48px] border-dashed border-white/10"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 rounded-[32px] mb-8 border border-white/5">
              <BookOpen className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Your learning journey starts here.</h3>
            <p className="text-slate-500 font-bold max-w-md mx-auto">
              Type any topic above to generate a personalized AI learning path with curated videos and evaluations.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div 
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="group block cursor-pointer glass-dark p-10 rounded-[40px] border-white/5 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="px-5 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-blue-500/20 shadow-lg shadow-blue-500/5">
                      {course.skillLevel}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleDeleteCourse(e, course.id)}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all border border-white/10 z-10"
                        title="Delete Path"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-blue-400 transition-colors">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-6 group-hover:text-blue-400 transition-colors leading-tight flex-grow">
                    {course.topic}
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-500">Progress: {course.progress || 0}%</span>
                      <span className="text-blue-400">{course.completedLessons?.length || 0} / {course.lessons.length}</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full shadow-lg shadow-blue-500/20" 
                      ></motion.div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons.length} Lessons
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Link 
                        to="/progress"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-slate-400 transition-all border border-white/5 uppercase tracking-widest"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Progress
                      </Link>
                      <div className="flex-1 sm:flex-none flex items-center text-blue-400 font-black text-xs uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                        Continue
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
