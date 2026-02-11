import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/GlassCard";
import { HashRateChart } from "@/components/HashRateChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/firebase";
import { 
  Wifi, 
  Clock, 
  Zap, 
  TrendingUp, 
  Server, 
  AlertCircle,
  Shield,
  CheckCircle2,
  Calculator,
  Sparkles,
  ArrowRight,
  Cpu,
  Flame
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useBTCPrice } from "@/hooks/useBTCPrice";
import { useCryptoPrices, CryptoType } from "@/hooks/useCryptoPrices";
import { LiveGrowingBalance } from "@/components/LiveGrowingBalance";
import { StripePayButton } from "@/components/StripePayButton";
import type { ChartDataPoint, MiningContract, PoolStatus } from "@/lib/types";

import btcMineImg from "@assets/Bitcoin_Mine_1766014388617.webp";
import ltcMineImg from "@assets/Gemini_Generated_Image_1ri2av1ri2av1ri2_(1)_1766014388604.webp";
import btcProImg from "@assets/Bitcoin Depository.png";
import btcPremiumPlusImg from "@assets/PremiumPlus.png";
import ltcMiningCart from "@assets/Gemini_Generated_Image_46ieyx46ieyx46ie_(1)_1766014388603.webp";

interface MiningProps {
  chartData: ChartDataPoint[];
  contracts: MiningContract[];
  poolStatus: PoolStatus;
  onNavigateToInvest: () => void;
}

const mockPoolStatus: PoolStatus = {
  connected: true,
  poolName: "CryptoPool Pro",
  hashRate: "976.5 TH/s",
  uptime: 99.98,
  workers: 2,
};

// Mining packages (hashrate plans)
interface MiningPackage {
  id: string;
  name: string;
  crypto: "BTC" | "LTC";
  cost: number;
  hashrate: string;
  hashrateValue: number;
  hashrateUnit: string;
  duration: number;
  returnPercent: number;
  dailyReturnBTC: number;
  paybackMonths: number;
  efficiency: string;
  image: string;
  popular?: boolean;
}

const miningPackages: MiningPackage[] = [
  {
    id: "btc-pro",
    name: "Pro",
    crypto: "BTC",
    cost: 169.99,
    hashrate: "6 TH/s",
    hashrateValue: 6,
    hashrateUnit: "TH/s",
    duration: 0, // One-time
    returnPercent: 125,
    dailyReturnBTC: 0.00000630,
    paybackMonths: 9,
    efficiency: "15W/TH",
    image: btcProImg,
  },
  {
    id: "btc-premium",
    name: "Premium",
    crypto: "BTC",
    cost: 349.99,
    hashrate: "14 TH/s",
    hashrateValue: 14,
    hashrateUnit: "TH/s",
    duration: 0, // One-time
    returnPercent: 145,
    dailyReturnBTC: 0.00001470,
    paybackMonths: 8,
    efficiency: "15W/TH",
    image: btcMineImg,
    popular: true,
  },
  {
    id: "btc-premium-plus",
    name: "Premium+",
    crypto: "BTC",
    cost: 699.99,
    hashrate: "30 TH/s",
    hashrateValue: 30,
    hashrateUnit: "TH/s",
    duration: 0, // One-time
    returnPercent: 155,
    dailyReturnBTC: 0.00003150,
    paybackMonths: 7,
    efficiency: "15W/TH",
    image: btcPremiumPlusImg,
  },
];

const trustBadges = [
  { icon: Clock, label: "24/7 Mining", description: "Non-stop operation" },
  { icon: Shield, label: "Transparent Returns", description: "Clear profit tracking" },
  { icon: Zap, label: "Instant Withdrawals", description: "Get paid fast" },
  { icon: CheckCircle2, label: "Secure & Verified", description: "Enterprise security" },
];

function AnimatedHashrateDisplay({ value, unit }: { value: number; unit: string }) {
  return (
    <motion.div
      className="flex items-baseline gap-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="text-3xl font-bold text-foreground"
        data-testid="text-total-hashrate"
        animate={{ 
          textShadow: [
            "0 0 10px rgba(247, 147, 26, 0.3)",
            "0 0 20px rgba(247, 147, 26, 0.5)",
            "0 0 10px rgba(247, 147, 26, 0.3)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {value.toFixed(1)}
      </motion.span>
      <span className="text-base text-muted-foreground">{unit}</span>
    </motion.div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          initial={{ 
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: 0 
          }}
          animate={{ 
            y: "-10%",
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function ContractCard({ contract, index }: { contract: MiningContract; index: number }) {
  const isBTC = contract.cryptoType === "BTC";
  const progressPercent = ((contract.totalDays - contract.daysRemaining) / contract.totalDays) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
      data-testid={`card-contract-${contract.id}`}
    >
      <GlassCard 
        animate={false} 
        glow={isBTC ? "btc" : "ltc"}
        className="relative"
      >
        <FloatingParticles />
        
        <div className="flex items-start gap-4">
          <motion.div 
            className="relative w-14 h-14 flex-shrink-0"
            animate={{ 
              y: [0, -3, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src={isBTC ? btcMineImg : ltcMineImg} 
              alt={`${contract.cryptoType} Mining`}
              className="w-full h-full object-contain drop-shadow-lg"
              data-testid={`img-contract-${contract.cryptoType.toLowerCase()}`}
            />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground text-sm" data-testid={`text-contract-type-${contract.id}`}>
                {contract.cryptoType} Mining
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${isBTC ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}
                data-testid={`badge-contract-status-${contract.id}`}
              >
                Active
              </Badge>
            </div>
            
            <div className="text-xl font-bold text-foreground" data-testid={`text-contract-hashrate-${contract.id}`}>
              {contract.hashrate} {contract.hashrateUnit}
            </div>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="w-3 h-3" />
              Days Remaining
            </span>
            <span className="font-medium text-foreground text-xs" data-testid={`text-days-remaining-${contract.id}`}>
              {contract.daysRemaining} / {contract.totalDays}
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-1" />
          
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="liquid-glass-subtle rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground mb-0.5">Earned So Far</div>
              <div className="font-semibold text-foreground text-sm" data-testid={`text-earned-${contract.id}`}>
                {contract.earnedSoFar.toFixed(isBTC ? 5 : 3)} {contract.cryptoType}
              </div>
            </div>
            <div className="liquid-glass-subtle rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground mb-0.5">Daily Rate</div>
              <div className="font-semibold text-emerald-400 text-sm" data-testid={`text-daily-rate-${contract.id}`}>
                +{contract.dailyEarningRate.toFixed(isBTC ? 6 : 4)} {contract.cryptoType}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function PoolStatusCard({ status }: { status: PoolStatus }) {
  return (
    <GlassCard delay={0.25}>
      <div className="flex items-center gap-2 mb-3">
        <Server className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Pool Status</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.connected ? "bg-emerald-400" : "bg-red-400"}`}>
            {status.connected && (
              <motion.div
                className="w-full h-full rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Status</div>
            <div className="font-medium text-foreground text-xs" data-testid="text-pool-status">
              {status.connected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          <div>
            <div className="text-[10px] text-muted-foreground">Pool Hash Rate</div>
            <div className="font-medium text-foreground text-xs" data-testid="text-pool-hashrate">
              {status.hashRate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <div>
            <div className="text-[10px] text-muted-foreground">Uptime</div>
            <div className="font-medium text-foreground text-xs" data-testid="text-pool-uptime">
              {status.uptime}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-muted-foreground" />
          <div>
            <div className="text-[10px] text-muted-foreground">Active Workers</div>
            <div className="font-medium text-foreground text-xs" data-testid="text-pool-workers">
              {status.workers}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Active Mining Purchases Component
function ActiveMiningPurchases({ 
  purchases, 
  btcPrice 
}: { 
  purchases: any[]; 
  btcPrice: number;
}) {
  const { convert, getSymbol } = useCurrency();
  
  if (!purchases || purchases.length === 0) return null;

  // Filter out solo mining purchases - they should only appear on Solo Mining page
  const activePurchases = purchases.filter((p) => 
    p.status === "active" && !String(p?.packageName || "").includes("Solo Mining")
  );
  
  if (activePurchases.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active Mining Purchases</h3>
              <p className="text-xs text-muted-foreground">{activePurchases.length} active</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {activePurchases.map((purchase) => {
            const dailyUSD = purchase.dailyReturnBTC * btcPrice;
            const totalEarnedUSD = purchase.totalEarned * btcPrice;
            const displayedDailyBTC = purchase.dailyReturnBTC;

            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        {purchase.crypto}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {purchase.packageName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {purchase.hashrate} {purchase.hashrateUnit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-400">
                      +{getSymbol()}{convert(dailyUSD).toFixed(2)}/day
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ₿{displayedDailyBTC.toFixed(8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cost</p>
                    <p className="text-xs font-medium text-foreground">
                      {getSymbol()}{convert(purchase.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Total Earned</p>
                    <p className="text-xs font-medium text-green-400">
                      +{getSymbol()}{convert(totalEarnedUSD).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">ROI</p>
                    <p className="text-xs font-medium text-amber-400">
                      {purchase.returnPercent}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function PackageCard({ pkg, index, onPurchase, isPending, userId }: { pkg: MiningPackage; index: number; onPurchase: (pkg: MiningPackage) => void; isPending?: boolean; userId?: string | null }) {
  const { convert, getSymbol } = useCurrency();
  const { btcPrice } = useBTCPrice();
  const isBTC = pkg.crypto === "BTC";
  
  // Calculate daily return in USD
  const dailyReturnUSD = pkg.dailyReturnBTC * btcPrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-testid={`card-package-${pkg.id}`}
    >
      <GlassCard 
        className="relative p-4" 
        glow={isBTC ? "btc" : "ltc"}
        animate={false}
      >
        {pkg.popular && (
          <Badge 
            className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs"
            data-testid={`badge-popular-${pkg.id}`}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
        
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 flex-shrink-0">
            <img 
              src={pkg.image} 
              alt={`${pkg.crypto} ${pkg.name}`}
              className="w-full h-full object-contain"
              data-testid={`img-package-${pkg.id}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isBTC 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                {pkg.crypto}
              </span>
              <h3 className="font-semibold text-foreground text-sm">{pkg.name}</h3>
              <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30 px-1.5 py-0">
                5 YEARS
              </Badge>
            </div>
            
            <div className="text-xl font-bold text-foreground mb-2">
              {getSymbol()}{convert(pkg.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
              <div>
                <span className="text-muted-foreground">Hashrate</span>
                <p className="font-medium text-foreground text-xs">{pkg.hashrate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency</span>
                <p className="font-medium text-foreground text-xs">{pkg.efficiency}</p>
              </div>
              <div>
                <span className="text-muted-foreground">ROI</span>
                <p className="font-medium text-foreground text-xs">{pkg.returnPercent}%</p>
              </div>
            </div>
            
            <div className="mb-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Daily Return:</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-400">
                    {getSymbol()}{convert(dailyReturnUSD).toFixed(2)}/day
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    ₿{pkg.dailyReturnBTC.toFixed(8)}
                  </p>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground text-center">
                  Payback in ~{pkg.paybackMonths} months
                </p>
              </div>
            </div>
            
            <Button 
              size="sm"
              className={isBTC 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 h-8 text-xs w-full" 
                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 h-8 text-xs w-full"
              }
              disabled={isPending}
              onClick={() => onPurchase(pkg)}
              data-testid={`button-buy-${pkg.id}`}
            >
              {isPending ? "Processing..." : "Buy Now"}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            {userId && (
              <StripePayButton
                userId={userId}
                amount={pkg.cost}
                productType="mining_package"
                productId={pkg.id}
                productName={`${pkg.crypto} ${pkg.name} Mining Package`}
                metadata={{ hashrate: pkg.hashrateValue, hashrateUnit: pkg.hashrateUnit, crypto: pkg.crypto }}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs mt-1"
                onPaymentSuccess={() => {
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function HashRateCalculator({ onPurchase, isPending, userId }: { onPurchase: (data: { hashrate: number; cost: number; dailyReturnBTC: number; returnPercent: number }) => void; isPending?: boolean; userId?: string | null }) {
  const { convert, getSymbol } = useCurrency();
  const { btcPrice } = useBTCPrice();
  
  const [btcHashrate, setBtcHashrate] = useState<number>(0.3);
  const [period, setPeriod] = useState<"daily" | "annual">("annual");
  
  // Base price is $30 per 1TH
  const basePrice = 30;
  
  // Calculate discount based on hashrate - more hashrate = lower price per TH
  const getPricePerTH = (hashrate: number) => {
    if (hashrate >= 100) return basePrice * 0.70; // 30% discount
    if (hashrate >= 50) return basePrice * 0.75; // 25% discount
    if (hashrate >= 30) return basePrice * 0.80; // 20% discount
    if (hashrate >= 20) return basePrice * 0.85; // 15% discount
    if (hashrate >= 10) return basePrice * 0.90; // 10% discount
    if (hashrate >= 5) return basePrice * 0.95; // 5% discount
    return basePrice; // No discount
  };
  
  const pricePerTH = getPricePerTH(btcHashrate);
  const estimatedCost = btcHashrate * pricePerTH;
  
  // New calculation logic: up to 20% return on investment
  // The return is approximately 20% of the purchase price
  const annualUSDReturn = estimatedCost * 1.20; // 20% return
  const dailyUSDReturn = annualUSDReturn / 365;
  
  // Convert USD returns to BTC
  const annualBTCReturn = annualUSDReturn / btcPrice;
  const dailyBTCReturn = dailyUSDReturn / btcPrice;
  
  // Calculate potential return if BTC reaches $150,000
  const futurePrice = 150000;
  const futureAnnualReturn = annualBTCReturn * futurePrice;
  
  const hashrateDisplay = `${btcHashrate} TH/s`;
  
  return (
    <GlassCard className="p-5" variant="strong">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Custom Hashrate Calculator</h2>
          <p className="text-xs text-muted-foreground">Build your own mining package</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="mb-4">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            VALID FOR 7 YEARS
          </Badge>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Bitcoin Hashrate</Label>
            <span className="text-base font-bold text-amber-400">
              {hashrateDisplay}
            </span>
          </div>
          <Slider
            value={[btcHashrate]}
            onValueChange={(v) => setBtcHashrate(Math.round(v[0] * 10) / 10)}
            min={0.3}
            max={500}
            step={0.1}
            className="py-2"
            data-testid="slider-hashrate"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.3 TH/s</span>
            <span>500 TH/s</span>
          </div>
        </div>
        
        <div className="p-3 rounded-xl border border-white/[0.08] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Price per TH/s</span>
            <p className="text-sm font-bold text-foreground">
              {getSymbol()}{convert(pricePerTH).toFixed(2)}
              {pricePerTH < basePrice && (
                <span className="text-green-400 text-xs ml-1">
                  (-{Math.round((1 - pricePerTH/basePrice) * 100)}%)
                </span>
              )}
            </p>
          </div>
          
          <div className="border-t border-white/[0.08] pt-3">
            <span className="text-xs text-muted-foreground">Contract Cost</span>
            <p className="text-2xl font-bold text-foreground">
              {getSymbol()}{convert(estimatedCost).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Yield Calculator</Label>
          <Select 
            value={period} 
            onValueChange={(v) => setPeriod(v as "daily" | "annual")}
            defaultValue="annual"
          >
            <SelectTrigger data-testid="select-period" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Return</SelectItem>
              <SelectItem value="annual">Annual Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">
              {period === "daily" ? "Daily" : "Annual"} Return
            </span>
            <div className="text-right">
              <p className="text-sm font-bold text-green-400">
                {getSymbol()}{convert(period === "daily" ? dailyUSDReturn : annualUSDReturn).toFixed(2)}
                {period === "daily" ? "/day" : "/year"}
              </p>
              <p className="text-[9px] text-muted-foreground">
                ₿{(period === "daily" ? dailyBTCReturn : annualBTCReturn).toFixed(8)}
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground">
              * Based on today's BTC price: ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="pt-2 border-t border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-amber-400">If BTC reaches $150,000:</span>
              <p className="text-xs font-bold text-amber-400">
                {getSymbol()}{convert(futureAnnualReturn).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year
              </p>
            </div>
          </div>
          
          {btcHashrate >= 10 && (
            <div className="pt-2 border-t border-border/30">
              <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                +10% Volume Bonus Applied
              </Badge>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
          size="default"
          disabled={isPending}
          onClick={() => {
            console.log("=== BUY CUSTOM HASHPOWER BUTTON CLICKED ===");
            console.log("Button state:", { isPending });
            console.log("Data being sent:", {
              hashrate: btcHashrate,
              cost: estimatedCost,
              dailyBTCReturn,
              returnPercent: 20,
            });
            onPurchase({
              hashrate: btcHashrate,
              cost: estimatedCost,
              dailyReturnBTC: dailyBTCReturn,
              returnPercent: 20,
            });
            console.log("=== onPurchase called ===");
          }}
          data-testid="button-buy-custom"
        >
          {isPending ? "Processing..." : "Buy Custom Hashpower"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        {userId && (
          <StripePayButton
            userId={userId}
            amount={estimatedCost}
            productType="mining_package"
            productName={`Custom BTC Mining ${btcHashrate} TH/s`}
            metadata={{ hashrate: btcHashrate, hashrateUnit: "TH/s", crypto: "BTC" }}
            variant="outline"
            className="w-full mt-2"
            onPaymentSuccess={() => window.location.reload()}
          />
        )}
        
        <p className="text-center text-[10px] text-muted-foreground">
          All rewards paid in BTC
        </p>
      </div>
    </GlassCard>
  );
}

function EmptyState({ onNavigateToInvest }: { onNavigateToInvest: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="text-center py-8">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4"
        >
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-empty-title">
          No Active Contracts
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto" data-testid="text-empty-description">
          Purchase hashpower below to start mining crypto.
        </p>
      </GlassCard>
    </motion.div>
  );
}

// Supported payment currencies for mining purchases
const paymentCurrencies: CryptoType[] = ["USDT", "BTC", "LTC", "ETH"];

export function Mining({ chartData, contracts, poolStatus, onNavigateToInvest }: MiningProps) {
  const [activeTab, setActiveTab] = useState<"devices" | "hot">("devices");
  const [paymentCurrency, setPaymentCurrency] = useState<CryptoType>("USDT");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  const { btcPrice } = useBTCPrice();
  const { prices: cryptoPrices } = useCryptoPrices();

  const { data: estimateConfig } = useQuery<{ miningEstimateMultiplier: number }>({
    queryKey: ["/api/config/estimates"],
    queryFn: async () => {
      const res = await fetch("/api/config/estimates");
      if (!res.ok) return { miningEstimateMultiplier: 1 };
      return res.json();
    },
    staleTime: 60000,
  });

  const userStr = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
  const storedUser = userStr ? (() => {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  })() : null;
  const dbUserId: string | null = storedUser?.id || null;
  
  const hasContracts = contracts.length > 0;
  
  // Fetch user's wallet balances
  const { data: balanceData } = useQuery<{ balances: Array<{ symbol: string; balance: number }>, pending: Record<string, number> }>({
    queryKey: ["/api/balances", dbUserId],
    queryFn: async () => {
      if (!dbUserId) return { balances: [], pending: {} };
      const response = await fetch(`/api/balances/${dbUserId}`);
      if (!response.ok) throw new Error("Failed to fetch balances");
      return response.json();
    },
    enabled: !!dbUserId,
  });
  
  const wallets = balanceData?.balances || [];

  // Fetch user's mining purchases
  const { data: miningPurchases = [] } = useQuery<any[]>({
    queryKey: ["/api/users", dbUserId, "mining-purchases"],
    queryFn: async () => {
      if (!dbUserId) return [];
      const response = await fetch(`/api/users/${dbUserId}/mining-purchases`);
      if (!response.ok) throw new Error("Failed to fetch mining purchases");
      return response.json();
    },
    enabled: !!dbUserId,
  });

  // Create mining purchase mutation
  const createPurchase = useMutation({
    mutationFn: async (purchaseData: any) => {
      const res = await fetch("/api/mining/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to purchase");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balances", dbUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", dbUserId, "mining-purchases"] });
      toast({
        title: "Purchase Successful!",
        description: "Your mining package is now active.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get balance for selected payment currency (case-insensitive)
  const selectedWallet = wallets.find((w: any) => w.symbol.toUpperCase() === paymentCurrency.toUpperCase());
  const availableBalance = selectedWallet?.balance || 0;
  
  // Convert USD cost to selected crypto currency
  const convertUSDToCrypto = (usdAmount: number, currency: CryptoType): number => {
    const price = cryptoPrices[currency]?.price || 1;
    return usdAmount / price;
  };
  
  // Handle package purchase
  const handlePackagePurchase = (pkg: MiningPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase mining packages.",
        variant: "destructive",
      });
      return;
    }

    if (!dbUserId) {
      toast({
        title: "Account Not Ready",
        description: "Please refresh once, then try again.",
        variant: "destructive",
      });
      return;
    }

    // Convert USD cost to selected payment currency
    const costInCrypto = convertUSDToCrypto(pkg.cost, paymentCurrency);
    
    if (availableBalance < costInCrypto) {
      const amountNeeded = costInCrypto - availableBalance;
      toast({
        title: "Deposit Required",
        description: `You need to deposit ${amountNeeded.toFixed(paymentCurrency === "USDT" ? 2 : 6)} ${paymentCurrency} to buy this contract. Total cost: ${costInCrypto.toFixed(paymentCurrency === "USDT" ? 2 : 6)} ${paymentCurrency}`,
        variant: "destructive",
      });
      return;
    }

    const purchasePayload = {
      userId: dbUserId,
      packageName: pkg.name,
      crypto: pkg.crypto,
      symbol: paymentCurrency,
      amount: costInCrypto,
      hashrate: pkg.hashrateValue,
      hashrateUnit: pkg.hashrateUnit,
      efficiency: pkg.efficiency,
      dailyReturnBTC: pkg.dailyReturnBTC,
      returnPercent: pkg.returnPercent,
      paybackMonths: pkg.paybackMonths,
    };
    
    createPurchase.mutate(purchasePayload);
  };

  // Handle custom hashpower purchase
  const handleCustomPurchase = (data: { hashrate: number; cost: number; dailyReturnBTC: number; returnPercent: number }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase mining packages.",
        variant: "destructive",
      });
      return;
    }

    if (!dbUserId) {
      toast({
        title: "Account Not Ready",
        description: "Please refresh once, then try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert USD cost to selected payment currency
    const costInCrypto = convertUSDToCrypto(data.cost, paymentCurrency);
    
    if (availableBalance < costInCrypto) {
      const amountNeeded = costInCrypto - availableBalance;
      toast({
        title: "Deposit Required",
        description: `You need to deposit ${amountNeeded.toFixed(paymentCurrency === "USDT" ? 2 : 6)} ${paymentCurrency} to buy this contract. Total cost: ${costInCrypto.toFixed(paymentCurrency === "USDT" ? 2 : 6)} ${paymentCurrency}`,
        variant: "destructive",
      });
      return;
    }

    // Calculate payback months safely
    const dailyUSDReturn = data.dailyReturnBTC * btcPrice;
    const paybackDays = dailyUSDReturn > 0 ? data.cost / dailyUSDReturn : 365;
    const paybackMonths = Math.ceil(paybackDays / 30);
    
    const purchasePayload = {
      userId: dbUserId,
      packageName: "Custom",
      crypto: "BTC",
      symbol: paymentCurrency,
      amount: costInCrypto,
      hashrate: data.hashrate,
      hashrateUnit: "TH/s",
      efficiency: "15W/TH",
      dailyReturnBTC: data.dailyReturnBTC,
      returnPercent: data.returnPercent,
      paybackMonths: paybackMonths,
    };
    
    createPurchase.mutate(purchasePayload);
  };
  
  // Filter out solo mining purchases - they should only appear on Solo Mining page
  const activePurchases = (miningPurchases || []).filter((p: any) => 
    p?.status === "active" && !String(p?.packageName || "").includes("Solo Mining")
  );

  const totalHashrateFromContracts = contracts.reduce((sum, c) => {
    if (c.hashrateUnit === "TH/s") return sum + c.hashrate;
    if (c.hashrateUnit === "MH/s") return sum + c.hashrate / 1000000;
    if (c.hashrateUnit === "PH/s") return sum + c.hashrate * 1000;
    return sum + c.hashrate / 1000;
  }, 0);

  const totalHashrateFromPurchases = activePurchases.reduce((sum: number, p: any) => {
    const unit = p?.hashrateUnit;
    const value = Number(p?.hashrate) || 0;
    if (unit === "TH/s") return sum + value;
    if (unit === "MH/s") return sum + value / 1000000;
    // Skip PH/s units here since those are solo mining
    return sum + value;
  }, 0);

  const totalHashrate = totalHashrateFromContracts + totalHashrateFromPurchases;
  const investedAmount = activePurchases.reduce((sum: number, p: any) => sum + (Number(p?.amount) || 0), 0);
  const projectedAmount = activePurchases.reduce((sum: number, p: any) => {
    const amount = Number(p?.amount) || 0;
    const roi = Number(p?.returnPercent) || 0;
    return sum + amount * (1 + roi / 100);
  }, 0);

  const miningEarningsPerSecondUSDTBase = activePurchases.reduce((sum: number, p: any) => {
    // Calculate 0.5% daily of invested amount
    const investmentAmount = Number(p?.amount) || 0;
    const dailyUSDT = investmentAmount * 0.005; // 0.5% daily
    return sum + dailyUSDT / 86400;
  }, 0);

  const miningEstimateMultiplier = Number(estimateConfig?.miningEstimateMultiplier) || 1;
  const miningEarningsPerSecondUSDT = miningEarningsPerSecondUSDTBase * miningEstimateMultiplier;

  const secondsSinceMidnight = (() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((Date.now() - midnight.getTime()) / 1000));
  })();

  const miningEstimatedTodayUSDT = miningEarningsPerSecondUSDT * secondsSinceMidnight;

  const btcPackages = miningPackages.filter(p => p.crypto === "BTC");

  return (
    <>
      <motion.div
        className="flex flex-col gap-5 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-testid="page-mining"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Mining</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your hashpower & mining packages
          </p>
        </motion.div>

      {/* Active Hashpower Card */}
      {(contracts.length + activePurchases.length > 0) && (
        <GlassCard delay={0.1} variant="strong" className="relative overflow-hidden py-5 px-5" glow="btc">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-amber-500/18 via-orange-500/10 to-transparent blur-2xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/14 via-blue-500/8 to-transparent blur-2xl" />
          </div>

          <FloatingParticles />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground mb-1">Your Active Hashpower</h2>
                <AnimatedHashrateDisplay value={totalHashrate} unit="TH/s" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Invested: ${investedAmount.toFixed(2)} USDT • Projected: ${projectedAmount.toFixed(2)} USDT
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs text-muted-foreground">{contracts.length + activePurchases.length} active</span>
              </div>
            </div>

            <div className="mt-3 liquid-glass rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated earnings today</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <LiveGrowingBalance
                      value={miningEstimatedTodayUSDT}
                      perSecond={miningEarningsPerSecondUSDT}
                      active={miningEarningsPerSecondUSDT > 0}
                      decimals={2}
                      className="text-xl font-bold text-foreground"
                    />
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/25">USDT</Badge>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Mining Purchases */}
      <ActiveMiningPurchases purchases={miningPurchases} btcPrice={btcPrice} />

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex gap-2 px-1"
      >
        <button
          onClick={() => setActiveTab("devices")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            activeTab === "devices"
              ? "bg-primary/20 text-primary border-2 border-primary/30"
              : "bg-white/5 text-muted-foreground border-2 border-transparent hover:bg-white/10"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Devices</span>
        </button>
        <button
          onClick={() => setActiveTab("hot")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            activeTab === "hot"
              ? "bg-red-500/20 text-red-400 border-2 border-red-500/30"
              : "bg-white/5 text-muted-foreground border-2 border-transparent hover:bg-white/10"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="flex items-center gap-1.5">
            Hashrate
            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">HOT</span>
          </span>
        </button>
      </motion.div>

      <GlassCard delay={0.16} className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Pay with:</p>
            <Select value={paymentCurrency} onValueChange={(v) => setPaymentCurrency(v as CryptoType)}>
              <SelectTrigger className="h-7 w-24 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentCurrencies.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm font-semibold text-foreground" data-testid="text-mining-balance">
            {paymentCurrency === "USDT" ? "$" : ""}{availableBalance.toFixed(paymentCurrency === "USDT" ? 2 : 6)} {paymentCurrency}
          </p>
        </div>
      </GlassCard>

      {/* Active Contracts (if any) */}
      {hasContracts && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Active Contracts</h2>
          <div className="flex flex-col gap-3">
            {contracts.map((contract, index) => (
              <ContractCard key={contract.id} contract={contract} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-2">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            data-testid={`badge-trust-${index}`}
          >
            <GlassCard className="p-2.5 text-center" variant="subtle" animate={false}>
              <badge.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-[10px] font-medium text-foreground">{badge.label}</p>
              <p className="text-[9px] text-muted-foreground">{badge.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bitcoin Mining Packages */}
      <AnimatePresence mode="wait">
        {activeTab === "devices" ? (
          <motion.div
            key="devices"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground">Pay with:</Label>
                <Select value={paymentCurrency} onValueChange={(v) => setPaymentCurrency(v as CryptoType)}>
                  <SelectTrigger className="h-7 w-24 text-xs bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentCurrencies.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-mining-pay-with">
                Available: {paymentCurrency === "USDT" ? "$" : ""}{availableBalance.toFixed(paymentCurrency === "USDT" ? 2 : 6)} {paymentCurrency}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-sm">₿</span>
                </div>
                <h2 className="text-base font-semibold text-foreground">Bitcoin Mining Devices</h2>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                  5 YEARS
                </Badge>
              </div>
              <div className="space-y-3">
                {btcPackages.map((pkg, index) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={index} onPurchase={handlePackagePurchase} isPending={createPurchase.isPending} userId={dbUserId} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <HashRateCalculator onPurchase={handleCustomPurchase} isPending={createPurchase.isPending} userId={dbUserId} />
            {hasContracts && (
              <>
                <HashRateChart data={chartData} title="Earnings Over Time" />
                <PoolStatusCard status={poolStatus} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Disclosure - App Store Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <GlassCard className="p-4 border-amber-500/20" variant="subtle">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-400">Investment Risk Disclosure</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cryptocurrency mining involves substantial risk. Mining returns are estimates only and depend on 
                network difficulty, cryptocurrency prices, and other factors beyond our control. Past performance 
                does not guarantee future results. You may lose some or all of your investment. This platform 
                does not provide financial advice. Please conduct your own research and consult with a qualified 
                financial advisor before purchasing any mining contracts.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      </motion.div>
    </>
  );
}
