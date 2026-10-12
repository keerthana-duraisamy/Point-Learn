import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Sparkles, Compass, Eye, ShieldCheck, Video, GraduationCap, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import WebsitePreviewModal from '../components/WebsitePreviewModal';
import previewImage from '../assets/images/website_preview_1791814814046.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreview = async () => {
    try {
      setLoading(true);
      await loginAsDemo();
      navigate('/');
    } catch (err) {
      console.error('Demo preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-16">
      <WebsitePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onExploreDemo={handleDemoPreview}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
        {/* Left Column: Website Preview & Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Website Preview & Platform Showcase
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
              Personalized Video Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Powered by Point Learn
              </span>
            </h1>
            <p className="text-slate-400 font-bold text-base sm:text-lg leading-relaxed max-w-xl">
              Turn any YouTube tutorial into a structured, interactive learning path with automated assessments and instant AI concept evaluation.
            </p>
          </div>

          {/* Interactive Preview Card Banner */}
          <div className="relative group rounded-[32px] overflow-hidden border border-white/10 bg-black shadow-2xl">
            <img
              src={previewImage}
              alt="Point Learn Interactive Dashboard Preview"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white font-black text-base">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Platform Preview
                  </div>
                  <p className="text-xs text-slate-300 font-bold">
                    YouTube timestamp segmentation • AI evaluation • Real-time progress
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Full Preview Card
                  </button>
                  <button
                    onClick={handleDemoPreview}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Launch Live Demo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { icon: Sparkles, title: 'AI Curated', desc: 'Custom Paths' },
              { icon: Video, title: 'YouTube Videos', desc: 'Timestamped' },
              { icon: GraduationCap, title: 'Evaluations', desc: 'Speech & Quizzes' },
              { icon: Award, title: 'Mastery', desc: 'Skill Badges' },
            ].map((f, i) => (
              <div key={i} className="glass p-3.5 rounded-2xl border-white/5 space-y-1">
                <f.icon className="w-4 h-4 text-blue-400 mb-1" />
                <div className="text-xs font-black text-white">{f.title}</div>
                <div className="text-[11px] text-slate-500 font-bold">{f.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Authentication Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="glass-dark p-8 sm:p-10 rounded-[44px] border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 blur-[80px] rounded-full"></div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl mb-1 shadow-lg shadow-blue-500/20">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Sign In</h2>
              <p className="text-slate-500 font-bold text-sm">Access your personalized learning paths</p>
            </div>

            {/* Quick Demo Preview Button */}
            <button
              type="button"
              onClick={handleDemoPreview}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-white font-black text-sm flex items-center justify-center gap-2 transition-all group shadow-lg shadow-blue-500/5"
            >
              <Compass className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
              <span>Preview Website as Guest Learner</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-black uppercase">
                1-Click
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-14 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white font-bold placeholder:text-slate-700 text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full pl-14 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white font-bold placeholder:text-slate-700 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-400 text-xs font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl shadow-xl shadow-blue-600/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center space-y-3">
              <p className="text-slate-500 text-xs font-bold">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 font-black hover:text-blue-300 transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

