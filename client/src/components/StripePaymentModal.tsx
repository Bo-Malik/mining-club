import { useState, useEffect, useCallback } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStripeConfig, createPaymentIntent } from "@/hooks/useStripe";
import { useKeyboardAdjustment } from "@/hooks/useKeyboardAdjustment";
import { CreditCard, CheckCircle2, XCircle, Loader2 } from "lucide-react";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// Reset when key changes
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
  
  // Handle keyboard on mobile
  useKeyboardAdjustment();

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{productName}</span>
          <span className="text-lg font-bold text-primary">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="min-h-[200px]">
        <PaymentElement
          options={{
            layout: "accordion",
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
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-base sticky bottom-0"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

interface StripePaymentModalProps {
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

export function StripePaymentModal({
  open,
  onClose,
  userId,
  amount,
  productType,
  productId,
  productName,
  metadata,
  onPaymentSuccess,
}: StripePaymentModalProps) {
  const { data: stripeConfig } = useStripeConfig();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "ready" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  // Create payment intent when modal opens
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

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Small delay to allow animation
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
    // Auto-close after success
    setTimeout(() => onClose(), 2000);
  }, [onPaymentSuccess, onClose]);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setPaymentStatus("error");
  }, []);

  if (!stripeConfig?.enabled) {
    return null;
  }

  const stripeObj = stripeConfig.publishableKey
    ? getStripePromise(stripeConfig.publishableKey)
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-4 rounded-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Setting up payment...</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="text-lg font-bold mb-1">Payment Successful!</h3>
            <p className="text-muted-foreground text-center text-sm">
              ${amount.toFixed(2)} charged for {productName}
            </p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold mb-1">Payment Failed</h3>
            <p className="text-muted-foreground text-center text-sm mb-3">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
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
                  borderRadius: "8px",
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
          <div className="text-center py-8">
            <p className="text-muted-foreground">Stripe is not fully configured yet.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
