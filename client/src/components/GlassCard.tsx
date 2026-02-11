import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  glow?: "btc" | "ltc" | "primary" | "none";
  variant?: "default" | "strong" | "subtle";
  topFade?: boolean;
  onClick?: () => void;
}

export function GlassCard({ 
  children, 
  className, 
  animate = true, 
  delay = 0,
  glow = "none",
  variant = "default",
  topFade = false,
  onClick
}: GlassCardProps) {
  const glowClass = glow === "btc" ? "glass-glow-btc" : glow === "ltc" ? "glass-glow-ltc" : glow === "primary" ? "glass-glow-primary" : "";
  const variantClass = variant === "strong" ? "liquid-glass-strong" : variant === "subtle" ? "liquid-glass-subtle" : "";
  
  const content = (
    <div
      className={cn(
        "relative rounded-2xl p-4 sm:p-5 overflow-hidden",
        "liquid-glass",
        variantClass,
        glowClass,
        className
      )}
      style={topFade ? {
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 30%, black 50%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 30%, black 50%)'
      } : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {content}
    </motion.div>
  );
}

export function LiquidGlassCard(props: GlassCardProps) {
  return <GlassCard {...props} />;
}
