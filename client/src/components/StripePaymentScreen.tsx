import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStripeConfig, createPaymentIntent } from "@/hooks/useStripe";
import { CreditCard, CheckCircle2, XCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export function resetStripePromise() {
  stripePromise = null;
}

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onClose: () => void;
  amount: number;
  productName: string;
}

function PaymentForm({ onSuccess, onError, onClose, amount, productName }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
        toast({
          title: "Payment Successful!",
          description: `$${amount.toFixed(2)} paid for ${productName}`,
        });
      }
    } catch (err: any) {
      onError(err.message || "Payment error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 rounded-t-2xl"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className="text-base font-semibold">Payment</span>
        <div className="w-16" />
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-4 space-y-4">
          {/* Order Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Summary</p>
            <div className="flex justify-between items-center">
              <span className="text-foreground font-medium">{productName}</span>
              <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
            </div>
            <div className="p-4">
              <PaymentElement
                options={{
                  layout: "tabs",
                  wallets: {
                    applePay: "auto",
                    googlePay: "auto",
                  },
                  defaultValues: {
                    billingDetails: {
                      address: {
                        country: "US",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs">Secured by Stripe</span>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div 
          className="sticky bottom-0 p-4 border-t border-border bg-background/95 backdrop-blur-sm rounded-b-2xl"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        >
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full h-14 text-base font-semibold rounded-2xl"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface StripePaymentScreenProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  amount: number;
  productType: string;
  productId?: string;
  productName: string;
  metadata?: Record<string, any>;
  onPaymentSuccess?: () => void;
}

export function StripePaymentScreen({
  open,
  onClose,
  userId,
  amount,
  productType,
  productId,
  productName,
  metadata,
  onPaymentSuccess,
}: StripePaymentScreenProps) {
  const { data: stripeConfig } = useStripeConfig();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "ready" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  // Create payment intent when screen opens
  useEffect(() => {
    if (!open || !stripeConfig?.enabled || !userId || paymentStatus !== "idle") return;

    setPaymentStatus("loading");
    createPaymentIntent({
      userId,
      amount,
      productType,
      productId,
      productName,
      metadata,
    })
      .then((result) => {
        setClientSecret(result.clientSecret);
        setPaymentStatus("ready");
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setPaymentStatus("error");
        toast({
          title: "Payment Setup Failed",
          description: err.message,
          variant: "destructive",
        });
      });
  }, [open, stripeConfig, userId, amount, productType, productId, productName]);

  // Reset state when screen closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setClientSecret(null);
        setPaymentStatus("idle");
        setErrorMessage("");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSuccess = useCallback(() => {
    setPaymentStatus("success");
    onPaymentSuccess?.();
    setTimeout(() => onClose(), 2000);
  }, [onPaymentSuccess, onClose]);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setPaymentStatus("error");
  }, []);

  if (!stripeConfig?.enabled || !open) {
    return null;
  }

  const stripeObj = stripeConfig.publishableKey
    ? getStripePromise(stripeConfig.publishableKey)
    : null;

  const content = (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col bg-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Content wrapper */}
      <div className="flex flex-col flex-1">
      {paymentStatus === "loading" && (
        <>
          {/* Header for loading state */}
          <div 
            className="flex items-center justify-between px-4 py-4 border-b border-border rounded-t-2xl"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -ml-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-base font-semibold">Payment</span>
            <div className="w-16" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Setting up payment...</p>
          </div>
        </>
      )}

      {paymentStatus === "success" && (
        <>
          <div 
            className="flex items-center justify-between px-4 py-4 border-b border-border rounded-t-2xl"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
          >
            <div className="w-16" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-base font-semibold">Success</span>
            </div>
            <div className="w-16" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground text-center text-lg">
              ${amount.toFixed(2)} charged for<br/>{productName}
            </p>
          </div>
        </>
      )}

      {paymentStatus === "error" && (
        <>
          <div 
            className="flex items-center justify-between px-4 py-4 border-b border-border rounded-t-2xl"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -ml-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-base font-semibold">Error</span>
            </div>
            <div className="w-16" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground text-center mb-8">{errorMessage}</p>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-8"
              onClick={() => {
                setPaymentStatus("idle");
                setErrorMessage("");
              }}
            >
              Try Again
            </Button>
          </div>
        </>
      )}

      {paymentStatus === "ready" && clientSecret && stripeObj && (
        <Elements
          stripe={stripeObj}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#6366f1",
                borderRadius: "12px",
                fontFamily: "Space Grotesk, system-ui, sans-serif",
              },
              rules: {
                '.Input': {
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '12px',
                },
                '.Tab': {
                  padding: '12px 16px',
                  borderRadius: '12px',
                },
                '.TabLabel': {
                  fontWeight: '500',
                },
              },
            },
          }}
        >
          <PaymentForm
            onSuccess={handleSuccess}
            onError={handleError}
            onClose={onClose}
            amount={amount}
            productName={productName}
          />
        </Elements>
      )}

      {!stripeConfig?.publishableKey && paymentStatus !== "loading" && (
        <>
          <div 
            className="flex items-center justify-between px-4 py-4 border-b border-border rounded-t-2xl"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -ml-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-base font-semibold">Payment</span>
            <div className="w-16" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Stripe is not configured.</p>
          </div>
        </>
      )}
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(content, document.body);
}

// Keep the old modal for backwards compatibility
export { StripePaymentScreen as StripePaymentModal };
