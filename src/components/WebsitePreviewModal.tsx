import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Video, 
  Award, 
  GraduationCap, 
  Layers, 
  Compass 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import previewImage from '../assets/images/website_preview_1791814814046.jpg';

interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDemo?: () => void;
}

export default function WebsitePreviewModal({ isOpen, onClose, onExploreDemo }: WebsitePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'social' | 'features'>('preview');

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const featurePillars = [
    {
      icon: Sparkles,
      title: 'AI Curriculum Generation',
      desc: 'Transforms any query or topic into structured multi-module courses with targeted learning objectives.',
      tag: 'Gemini AI'
    },
    {
      icon: Video,
      title: 'Curated YouTube Tutorials',
      desc: 'Embeddable video lessons aligned with key timestamps and zero fluff.',
      tag: 'Verified Video API'
    },
    {
      icon: GraduationCap,
      title: 'Interactive Evaluations',
      desc: 'Quizzes, coding challenges, hands-on tasks, and real-time conceptual speech evaluation.',
      tag: 'Dynamic Grading'
    },
    {
      icon: Award,
      title: 'Skill Progress Tracking',
      desc: 'Track mastery percentages, completed milestones, and earned competencies.',
      tag: 'Real-time Analytics'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#101014] border border-white/10 rounded-[36px] shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Point Learn Website Preview
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black">
                    Live OpenGraph & Card
                  </span>
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Personalized Video-Based Learning and Evaluation Platform
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-2 px-6 sm:px-8 pt-4 border-b border-white/5 bg-black/30">
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 px-4 text-sm font-black transition-all border-b-2 ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Visual Preview Card
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`pb-3 px-4 text-sm font-black transition-all border-b-2 ${
                activeTab === 'social'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Social Media Share View
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-3 px-4 text-sm font-black transition-all border-b-2 ${
                activeTab === 'features'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Feature Highlights
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
                  <img
                    src={previewImage}
                    alt="Point Learn Website Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Preview Asset
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Aspect Ratio</span>
                    <p className="text-sm font-black text-white">16:9 Landscape (High-Def)</p>
                  </div>
                  <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Card Resolution</span>
                    <p className="text-sm font-black text-white">1920 × 1080 Web Card</p>
                  </div>
                  <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Usage</span>
                    <p className="text-sm font-black text-emerald-400">OpenGraph & Twitter Card</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <p className="text-sm text-slate-400 font-bold">
                  Here is how the website link renders when shared on Discord, Slack, LinkedIn, Twitter/X, and messengers:
                </p>

                {/* Twitter / OpenGraph Card Mockup */}
                <div className="max-w-xl mx-auto rounded-3xl overflow-hidden border border-white/15 bg-[#16181c] shadow-2xl">
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <img
                      src={previewImage}
                      alt="Social share preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2 bg-[#121316]">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      pointlearn.app • AI Learning
                    </span>
                    <h4 className="text-base font-black text-white">
                      Point Learn – Personalized Video-Based Learning and Evaluation Platform
                    </h4>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2">
                      Generate tailored learning paths from YouTube videos with structured lessons, interactive AI comprehension evaluation, and real-time skill tracking.
                    </p>
                  </div>
                </div>

                {/* URL Share Box */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-300 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featurePillars.map((item, i) => (
                  <div
                    key={i}
                    className="glass p-5 rounded-2xl border-white/5 space-y-3 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-6 sm:p-8 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Point Learn v1.0 • Ready for full interactive exploration
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black transition-colors"
              >
                Close
              </button>
              {onExploreDemo && (
                <button
                  onClick={() => {
                    onClose();
                    onExploreDemo();
                  }}
                  className="flex-1 sm:flex-none btn-primary px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  Explore Live Demo
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
