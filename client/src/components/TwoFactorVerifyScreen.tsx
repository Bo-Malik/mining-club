import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, AlertCircle, Fingerprint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorVerifyScreenProps {
  userId: string;
  onSuccess: () => void;
  onBack?: () => void;
}

export function TwoFactorVerifyScreen({ userId, onSuccess, onBack }: TwoFactorVerifyScreenProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      if (!res.ok) {
        const data = await res.json();
        // Translate error messages to be more user-friendly
        let errorMessage = "Invalid code. Please try again.";
        if (data.error === "Invalid token") {
          errorMessage = "Incorrect code. Please check your authenticator app.";
        } else if (data.error === "2FA not enabled for this user") {
          errorMessage = "2FA is not set up for this account.";
        } else if (data.error === "User ID and token are required") {
          errorMessage = "Please enter the verification code.";
        } else if (data.error) {
          errorMessage = data.error;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verified",
        description: "Two-factor authentication successful",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setCode(["", "", "", "", "", ""]);
        setActiveIndex(0);
        inputRefs.current[0]?.focus();
      }, 600);
    },
  });

  const handleInputChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (digit && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        verifyMutation.mutate(fullCode);
      }
    }
  }, [code, verifyMutation]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const fullCode = code.join("");
      if (fullCode.length === 6) {
        verifyMutation.mutate(fullCode);
      }
    }
  }, [code, verifyMutation]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
      setCode(newCode);
      const nextIndex = Math.min(pastedData.length, 5);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();

      if (pastedData.length === 6) {
        verifyMutation.mutate(pastedData);
      }
    }
  }, [verifyMutation]);

  const fullCode = code.join("");
  const isComplete = fullCode.length === 6;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden safe-area-inset flex flex-col">
      {/* Background Elements - matching app standard */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-safe pb-4">
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </motion.button>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-safe">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verification Required
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code from your authenticator app
            </p>
          </motion.div>

          {/* Code Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mb-6 ${shake ? 'animate-shake' : ''}`}
          >
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="relative"
                >
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveIndex(index)}
                    disabled={verifyMutation.isPending}
                    className={`
                      w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl
                      border-2 transition-all duration-200 outline-none
                      bg-card/50 backdrop-blur-sm
                      ${error 
                        ? 'border-red-500 text-red-400' 
                        : activeIndex === index 
                          ? 'border-primary text-foreground ring-4 ring-primary/20' 
                          : digit 
                            ? 'border-primary/50 text-foreground' 
                            : 'border-border text-muted-foreground'
                      }
                      ${verifyMutation.isPending ? 'opacity-50' : ''}
                    `}
                  />
                  {activeIndex === index && !digit && !verifyMutation.isPending && (
                    <motion.div
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-400 text-sm mb-6"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence>
            {verifyMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 mb-6"
              >
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                </div>
                <span className="text-sm text-muted-foreground">Verifying...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verify Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => verifyMutation.mutate(fullCode)}
              disabled={!isComplete || verifyMutation.isPending}
              className={`
                w-full h-14 text-base font-semibold rounded-xl transition-all duration-300
                ${isComplete && !verifyMutation.isPending
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              {verifyMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </motion.div>

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-card/30 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-muted-foreground">
                  Open your authenticator app (Google Authenticator, Authy, etc.) and enter the current 6-digit code shown for BlockMint.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-muted-foreground text-sm mb-2">Lost access to your authenticator?</p>
            <a
              href="mailto:support@blockmint.app?subject=Reset%20My%20Two-Auth&body=I%20need%20help%20resetting%20my%20two-factor%20authentication%20for%20my%20BlockMint%20account."
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 px-4 pb-safe">
        <p className="text-xs text-muted-foreground">
          Protected by BlockMint Security
        </p>
      </footer>

      {/* Custom shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
