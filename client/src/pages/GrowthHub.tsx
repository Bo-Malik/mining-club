import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Users, Crown, Star, ChevronRight, Share2,
  Gift, TrendingUp, Shield, Award, ArrowLeft, Copy, Check,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StarterMinerCard } from "@/components/StarterMinerCard";
import { FounderBadge } from "@/components/FounderBadge";

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_APP_URL || "https://hardisk.co";

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.dbId || u.id || null;
  } catch {
    return null;
  }
}

interface GrowthHubProps {
  onBack?: () => void;
}

export function GrowthHub({ onBack }: GrowthHubProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const userId = getUserId();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/growth/profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const token = await getToken();
      const res = await fetch(`/api/growth/profile/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.ok ? res.json() : null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const referralLink = profile?.referral?.referralLink ?? `${PUBLIC_URL}/r/...`;
  const referralCode = profile?.referral?.referralCode ?? "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: "Link Copied!", description: "Share it to earn $10 per qualified referral." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const pillars = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Starter Miner",
      desc: "Your free 0.5 TH/s is active",
      color: "from-orange-500 to-amber-400",
      href: "/growth/starter",
      badge: profile?.starterReward?.status === "active" ? "ACTIVE" : undefined,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Refer & Earn",
      desc: `$10 per qualified invite · ${profile?.referral?.totalReferrals ?? 0} sent`,
      color: "from-blue-500 to-cyan-400",
      href: "/referral",
      badge: profile?.referral?.totalEarnings > 0 ? `$${profile.referral.totalEarnings}` : undefined,
    },
    {
      icon: <Crown className="w-5 h-5" />,
      label: "Founding Miners Club",
      desc: profile?.founder ? `Member #${profile.founder.sequence}` : `${profile?.founderStats?.remaining ?? "—"} spots left`,
      color: "from-purple-500 to-pink-400",
      href: "/founders",
      badge: profile?.founder ? profile.founder.tier : undefined,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Ambassador Program",
      desc: profile?.user?.isAmbassador ? "Active ambassador" : "Apply for higher tier perks",
      color: "from-emerald-500 to-teal-400",
      href: "/ambassador",
      badge: profile?.user?.ambassadorStatus === "active" ? "ACTIVE" : undefined,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold">Growth Hub</h1>
        <div className="ml-auto">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            hardisk.co
          </Badge>
        </div>
      </div>

      <div className="px-4 space-y-5 mt-5">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-transparent border border-orange-500/20 p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Growth Hub</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Mine. Share. Grow.</h2>
            <p className="text-sm text-muted-foreground">
              Your free miner is live. Invite friends, earn rewards, and secure your founder spot.
            </p>
          </div>
          {/* Decorative glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
        </motion.div>

        {/* Starter miner card */}
        {isLoading ? (
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ) : (
          <StarterMinerCard
            starterReward={profile?.starterReward}
            onViewDetails={() => navigate("/growth/starter")}
          />
        )}

        {/* Referral quick actions */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Your Referral Link</h3>
            <span className="text-xs text-muted-foreground">Earn $10 per referral</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-xs text-muted-foreground truncate font-mono border border-white/5">
              {referralCode ? `${PUBLIC_URL}/r/${referralCode}` : "Loading…"}
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" className="shrink-0 bg-primary/80 hover:bg-primary" onClick={() => navigate("/referral")}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </GlassCard>

        {/* Badges */}
        {profile?.badges?.length > 0 && (
          <GlassCard className="space-y-3">
            <h3 className="font-semibold text-sm">Your Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b: any) => (
                <BadgeChip key={b.badgeSlug} slug={b.badgeSlug} name={b.badgeName} />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Feature pillars grid */}
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link href={p.href}>
                <div className="relative rounded-2xl p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group overflow-hidden">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-3`}>
                    {p.icon}
                  </div>
                  {p.badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 uppercase tracking-wide">
                      {p.badge}
                    </span>
                  )}
                  <p className="text-sm font-semibold leading-tight">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{p.desc}</p>
                  <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Shield className="w-4 h-4" />, label: "How It Works", href: "/how-it-works" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Transparency", href: "/transparency" },
            { icon: <Gift className="w-4 h-4" />, label: "Referral Terms", href: "/referral-terms" },
          ].map(({ icon, label, href }) => (
            <Link key={label} href={href}>
              <div className="rounded-xl p-3 bg-white/5 border border-white/10 hover:border-white/20 transition-all text-center cursor-pointer">
                <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Badge chip sub-component
function BadgeChip({ slug, name }: { slug: string; name: string }) {
  const cfg: Record<string, { color: string; icon: string }> = {
    starter_miner: { color: "from-orange-500 to-amber-400", icon: "⛏️" },
    founder:       { color: "from-purple-600 to-pink-500", icon: "👑" },
    first_referral:{ color: "from-blue-500 to-cyan-400", icon: "🤝" },
    ambassador:    { color: "from-emerald-500 to-teal-400", icon: "🌟" },
  };
  const c = cfg[slug] ?? { color: "from-gray-500 to-gray-400", icon: "🏅" };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${c.color} bg-opacity-20 text-white text-xs font-medium`}>
      <span>{c.icon}</span>
      <span>{name}</span>
    </div>
  );
}

// Utility to get Firebase token
async function getToken(): Promise<string | null> {
  try {
    const { getAuth } = await import("firebase/auth");
    const user = getAuth().currentUser;
    return user ? user.getIdToken() : null;
  } catch {
    return null;
  }
}
