import { Crown, Star } from "lucide-react";

interface FounderBadgeProps {
  sequence?: number | null;
  tier?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const tierStyles: Record<string, { gradient: string; emoji: string; label: string }> = {
  founding:  { gradient: "from-purple-600 via-pink-500 to-orange-500", emoji: "👑", label: "Founding Member" },
  early:     { gradient: "from-blue-600 via-cyan-500 to-teal-400",    emoji: "⭐", label: "Early Member"   },
  community: { gradient: "from-emerald-600 to-teal-400",               emoji: "🌱", label: "Community Member" },
};

export function FounderBadge({ sequence, tier = "founding", size = "md", showLabel = true }: FounderBadgeProps) {
  const cfg = tierStyles[tier] ?? tierStyles.founding;
  const sizeMap = { sm: "w-8 h-8 text-base",  md: "w-12 h-12 text-xl", lg: "w-16 h-16 text-3xl" };
  const numSize = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Badge ring */}
      <div className={`relative ${sizeMap[size]} rounded-full bg-gradient-to-br ${cfg.gradient} p-0.5 shadow-lg`}>
        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
          <span role="img" aria-label={cfg.label}>{cfg.emoji}</span>
        </div>
        {/* Sequence number */}
        {sequence && (
          <span className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${cfg.gradient} text-white font-black ${numSize[size]} rounded-full px-1 min-w-[18px] text-center leading-[18px]`}>
            {sequence}
          </span>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-bold">{cfg.label}</p>
          {sequence && <p className="text-[10px] text-muted-foreground">#{sequence}</p>}
        </div>
      )}
    </div>
  );
}
