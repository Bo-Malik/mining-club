import { useState, useEffect, useCallback } from "react";
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
import { CreditCard, CheckCircle2, XCircle, Loader2, X, ArrowLeft } from "lucide-react";

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
  amount: number;
  productName: string;
}

function PaymentForm({ onSuccess, onError, amount, productName }: PaymentFormProps) {
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Order Summary */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{productName}</span>
          <span className="text-xl font-bold text-primary">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Payment Element - scrollable area */}
      <div className="flex-1 overflow-y-auto pb-4">
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
      
      {/* Fixed bottom button */}
      <div className="pt-4 border-t border-border bg-background">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
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

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment
        </h1>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 60px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' }}>
        {paymentStatus === "loading" && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Setting up payment...</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="flex flex-col items-center justify-center h-full">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground text-center">
              ${amount.toFixed(2)} charged for {productName}
            </p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="flex flex-col items-center justify-center h-full">
            <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground text-center mb-6">{errorMessage}</p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setPaymentStatus("idle");
                setErrorMessage("");
              }}
            >
              Try Again
            </Button>
          </div>
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
                  },
                  '.Tab': {
                    padding: '12px 16px',
                  },
                },
              },
            }}
          >
            <PaymentForm
              onSuccess={handleSuccess}
              onError={handleError}
              amount={amount}
              productName={productName}
            />
          </Elements>
        )}

        {!stripeConfig?.publishableKey && paymentStatus !== "loading" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Stripe is not configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep the old modal for backwards compatibility, but use the new screen
export { StripePaymentScreen as StripePaymentModal };
