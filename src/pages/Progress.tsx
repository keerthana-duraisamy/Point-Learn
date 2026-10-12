import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEvaluations, getUserCourses } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart2, 
  CheckCircle, 
  Trophy, 
  Target, 
  TrendingUp,
  BookOpen,
  HelpCircle,
  Brain,
  Code,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Progress() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const [evals, userCourses] = await Promise.all([
          getUserEvaluations(user.id),
          getUserCourses(user.id)
        ]);
        setEvaluations(evals);
        setCourses(userCourses);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  const completedLessons = courses.reduce((acc, c) => acc + (c.completedLessons?.length || 0), 0);
  const avgScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((acc, e) => acc + (e.score || 0), 0) / evaluations.length * 10) / 10 
    : 0;

  const stats = [
    { label: 'Lessons Completed', value: completedLessons, total: totalLessons, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Average AI Score', value: `${avgScore}/10`, icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Evaluations Done', value: evaluations.length, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Learning Paths', value: courses.length, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const typeStats = [
    { type: 'quiz', label: 'Quizzes', icon: HelpCircle, color: 'text-blue-400' },
    { type: 'task', label: 'Tasks', icon: Brain, color: 'text-emerald-400' },
    { type: 'project', label: 'Projects', icon: Code, color: 'text-purple-400' },
    { type: 'interview', label: 'Interviews', icon: MessageSquare, color: 'text-amber-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 py-10"
    >
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase">
          <Sparkles className="w-4 h-4" />
          Achievement Unlocked
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-4">
          <BarChart2 className="w-10 h-10 text-blue-500" />
          My Learning Progress
        </h1>
        <p className="text-xl text-slate-500 font-bold">Track your achievements and AI-powered evaluation results in real-time.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-dark p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center border border-white/5`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-1">
                {stat.value}
                {stat.total !== undefined && <span className="text-lg text-slate-600 font-black"> / {stat.total}</span>}
              </div>
              <div className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Course-by-Course Progress */}
        <div className="lg:col-span-3 space-y-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-500" />
            Course-by-Course Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course, i) => {
              const completed = course.completedLessons?.length || 0;
              const total = course.lessons?.length || 0;
              const percent = course.progress || 0;
              
              return (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-dark p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1">{course.topic}</h3>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{course.skillLevel}</div>
                    </div>
                    <div className="text-2xl font-black text-blue-400">{percent}%</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>{completed} / {total} Lessons</span>
                      <Link to={`/course/${course.id}`} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        Continue <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-500" />
              Recent Evaluations
            </h2>
            <button className="text-sm font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-2">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="glass-dark rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
            {evaluations.length === 0 ? (
              <div className="p-20 text-center text-slate-600 font-bold">No evaluations completed yet. Start learning to see your progress!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Score</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {evaluations.slice().reverse().map((ev, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="capitalize font-black text-white flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5`}>
                              {ev.type === 'quiz' && <HelpCircle className="w-4 h-4 text-blue-400" />}
                              {ev.type === 'task' && <Brain className="w-4 h-4 text-emerald-400" />}
                              {ev.type === 'project' && <Code className="w-4 h-4 text-purple-400" />}
                              {ev.type === 'interview' && <MessageSquare className="w-4 h-4 text-amber-400" />}
                            </div>
                            {ev.type}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-24 bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${ev.score * 10}%` }}></div>
                            </div>
                            <span className="font-black text-blue-400 text-lg">{ev.score}<span className="text-xs text-slate-600">/10</span></span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-bold line-clamp-1 max-w-xs group-hover:text-slate-300 transition-colors">{ev.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Performance by Type */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-white">Skill Breakdown</h2>
          <div className="glass-dark p-10 rounded-[48px] border-white/5 space-y-10 shadow-2xl">
            {typeStats.map((type, i) => {
              const typeEvals = evaluations.filter(e => e.type === type.type);
              const typeAvg = typeEvals.length > 0 
                ? Math.round(typeEvals.reduce((acc, e) => acc + e.score, 0) / typeEvals.length * 10) / 10 
                : 0;
              
              return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 font-black text-white uppercase tracking-widest text-xs">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5`}>
                        <type.icon className={`w-4 h-4 ${type.color}`} />
                      </div>
                      {type.label}
                    </div>
                    <div className="text-lg font-black text-white">{typeAvg}<span className="text-xs text-slate-600">/10</span></div>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${typeAvg * 10}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                      className={`h-full rounded-full shadow-lg ${type.color.replace('text', 'bg')}`} 
                    ></motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{typeEvals.length} Completed</div>
                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Top 5%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Achievement Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">You're in the top 10% of learners!</h3>
              <p className="text-blue-100 font-bold text-sm">Keep up the great work and complete 5 more evaluations to reach the next level.</p>
              <button className="w-full py-4 bg-white text-blue-600 font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg">
                Claim Reward
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
