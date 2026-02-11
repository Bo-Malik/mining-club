import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStripeConfig } from "@/hooks/useStripe";
import { StripePaymentModal } from "./StripePaymentScreen";
import paymentMethodsImg from "@assets/payment-methods.png";

// Payment method logos (Visa, Mastercard, Apple Pay, Google Pay)
const PaymentLogos = () => (
  <img src={paymentMethodsImg} alt="Visa, Mastercard, Apple Pay, Google Pay" className="h-5 ml-1.5 inline-block object-contain" />
);

interface StripePayButtonProps {
  userId: string;
  amount: number;
  productType: string; // mining_package, earn_plan, wallet_deposit, solo_mining
  productId?: string;
  productName: string;
  metadata?: Record<string, any>;
  onPaymentSuccess?: () => void;
  onPaymentStart?: () => void; // Called when payment modal opens - use to close parent dialogs
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
  onPaymentStart,
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

  const handleClick = () => {
    onPaymentStart?.(); // Close parent dialog first
    setShowPayment(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`overflow-hidden ${className}`}
        disabled={disabled}
        onClick={handleClick}
      >
        {children || (
          <span className="flex items-center justify-center gap-1.5 truncate">
            <span className="truncate">Pay ${amount.toFixed(2)}</span>
            <PaymentLogos />
          </span>
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
