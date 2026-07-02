import { useRef } from "react";
import type { CreativeItem } from "../types";
import { Play } from "lucide-react";

function CreativeCard({ item }: { item: CreativeItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => videoRef.current?.play();
  const handleMouseLeave = () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  return (
    <div
      className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 transition-all
            hover:border-cyan-500/50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video relative overflow-hidden bg-slate-800">
        <video
          ref={videoRef}
          src={item.video_path}
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
          <Play className="text-white/20 w-12 h-12" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
            {item.title}
          </h3>
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 rounded">
            {item.tech}
          </span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default CreativeCard;
