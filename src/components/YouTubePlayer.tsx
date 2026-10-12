import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Video, AlertCircle, Play } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  fallbackVideoIds?: string[];
  title: string;
  startTime?: number;
  endTime?: number;
}

export default function YouTubePlayer({
  videoId,
  fallbackVideoIds = [],
  title,
  startTime = 0,
  endTime = 0
}: YouTubePlayerProps) {
  const allVideoIds = [videoId, ...(fallbackVideoIds || [])].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset to primary video when a new videoId prop is passed (e.g. changing lessons)
  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
  }, [videoId]);

  const currentVideoId = allVideoIds[currentIndex] || videoId || 'bMknfKXIFA8';
  const isFallback = currentIndex > 0;

  // Build embed URL with start and end times if specified
  const buildEmbedUrl = (id: string) => {
    let url = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`;
    if (currentIndex === 0) {
      if (startTime > 0) url += `&start=${startTime}`;
      if (endTime > 0) url += `&end=${endTime}`;
    }
    return url;
  };

  const handleNextVideo = () => {
    if (currentIndex < allVideoIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHasError(false);
    } else {
      setCurrentIndex(0);
      setHasError(false);
    }
  };

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${currentVideoId}${
    startTime > 0 ? `&t=${startTime}s` : ''
  }`;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden group">
      {/* YouTube Iframe Player */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        <iframe
          key={`${currentVideoId}-${currentIndex}`}
          src={buildEmbedUrl(currentVideoId)}
          title={title || 'YouTube Video Player'}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      </div>

      {/* Playback Controls & Alternative Video Switcher Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 font-bold border border-red-500/30 shrink-0">
            <Video className="w-3.5 h-3.5" />
            YouTube
          </span>
          {isFallback && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30 shrink-0">
              Alternative Video #{currentIndex + 1}
            </span>
          )}
          <span className="text-slate-400 truncate max-w-[220px] sm:max-w-xs md:max-w-md hidden sm:inline">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {allVideoIds.length > 1 && (
            <button
              onClick={handleNextVideo}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors font-semibold"
              title="Switch to another matching YouTube tutorial for this topic"
            >
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span>
                Switch Video ({currentIndex + 1}/{allVideoIds.length})
              </span>
            </button>
          )}

          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors font-semibold"
            title="Open and watch video directly on YouTube"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in YouTube</span>
          </a>
        </div>
      </div>

      {/* Error Fallback Banner */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400" />
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Video unavailable in embedded mode</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              This specific video creator disabled embedded external playback or the video is restricted.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {allVideoIds.length > 1 && (
              <button
                onClick={handleNextVideo}
                className="btn-primary py-2 px-4 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try Alternate Video
              </button>
            )}
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2 px-4 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Watch on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
