import { useState } from "react";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  platform?: 'tiktok' | 'instagram' | 'youtube';
  posterUrl?: string;
  caption?: string;
}

const VideoEmbed = ({ url, platform = 'tiktok', posterUrl, caption }: VideoEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const getEmbedUrl = () => {
    if (platform === 'youtube') {
      // Extract video ID from YouTube URL
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (platform === 'tiktok') {
      // TikTok embed URL
      return url.includes('embed') ? url : url;
    }
    if (platform === 'instagram') {
      // Instagram embed
      return url.includes('embed') ? url : `${url}embed`;
    }
    return url;
  };

  const getPlatformLabel = () => {
    const labels = {
      tiktok: 'TikTok',
      instagram: 'Instagram',
      youtube: 'YouTube'
    };
    return labels[platform];
  };

  return (
    <div className="relative aspect-[9/16] max-w-sm mx-auto overflow-hidden bg-stone-800">
      {!isLoaded ? (
        // Poster/Placeholder State
        <button
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 group"
          aria-label={`Play ${getPlatformLabel()} video`}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>

          {/* Platform Badge */}
          <span className="absolute bottom-4 left-4 text-xs uppercase tracking-wider text-white/80 bg-black/40 px-3 py-1">
            {getPlatformLabel()}
          </span>
        </button>
      ) : (
        // Loaded iframe
        <iframe
          src={getEmbedUrl()}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${getPlatformLabel()} video embed`}
        />
      )}

      {/* Caption */}
      {caption && (
        <p className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-xs text-white/80 font-light">
          {caption}
        </p>
      )}
    </div>
  );
};

export default VideoEmbed;
