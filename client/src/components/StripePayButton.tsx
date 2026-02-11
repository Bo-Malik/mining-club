import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStripeConfig } from "@/hooks/useStripe";
import { StripePaymentModal } from "./StripePaymentScreen";
import { CreditCard } from "lucide-react";
import paymentMethodsImg from "@assets/payment-methods.png";

// Payment method logos (Visa, Mastercard, Apple Pay, Google Pay)
const PaymentLogos = () => (
  <img src={paymentMethodsImg} alt="Visa, Mastercard, Apple Pay, Google Pay" className="h-8 ml-2 inline-block object-contain" />
);

interface StripePayButtonProps {
  userId: string;
  amount: number;
  productType: string; // mining_package, earn_plan, wallet_deposit, solo_mining
  productId?: string;
  productName: string;
  metadata?: Record<string, any>;
  onPaymentSuccess?: () => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Drop-in "Pay with Stripe" button. Only renders if Stripe is enabled in admin settings.
 * Use it anywhere in the app - it handles everything automatically.
 */
export function StripePayButton({
  userId,
  amount,
  productType,
  productId,
  productName,
  metadata,
  onPaymentSuccess,
  className,
  variant = "default",
  size = "default",
  children,
  disabled,
}: StripePayButtonProps) {
  const { data: stripeConfig, isLoading } = useStripeConfig();
  const [showPayment, setShowPayment] = useState(false);

  // Don't render if Stripe is not enabled
  if (isLoading || !stripeConfig?.enabled) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={() => setShowPayment(true)}
      >
        {children || (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)}
            <PaymentLogos />
          </>
        )}
      </Button>

      <StripePaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        userId={userId}
        amount={amount}
        productType={productType}
        productId={productId}
        productName={productName}
        metadata={metadata}
        onPaymentSuccess={() => {
          setShowPayment(false);
          onPaymentSuccess?.();
        }}
      />
    </>
  );
}
