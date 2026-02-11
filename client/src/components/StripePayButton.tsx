import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStripeConfig } from "@/hooks/useStripe";
import { StripePaymentModal } from "./StripePaymentModal";
import { CreditCard } from "lucide-react";

// Inline SVG payment method logos
const PaymentLogos = () => (
  <span className="inline-flex items-center gap-1 ml-1.5">
    {/* Visa */}
    <svg viewBox="0 0 48 32" className="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#1A1F71"/>
      <path d="M19.5 21H17L18.8 11H21.3L19.5 21ZM15.4 11L13 18L12.7 16.5L11.8 12C11.8 12 11.7 11 10.3 11H6.1L6 11.2C6 11.2 7.6 11.6 9.4 12.7L11.6 21H14.2L18.1 11H15.4ZM37 21H39.3L37.3 11H35.3C34.1 11 33.8 12 33.8 12L30 21H32.6L33.1 19.5H36.3L37 21ZM33.9 17.5L35.3 13.6L36.1 17.5H33.9ZM30 14L30.4 11.8C30.4 11.8 28.9 11.2 27.3 11.2C25.6 11.2 21.6 12 21.6 15.5C21.6 18.8 26.2 18.8 26.2 20.5C26.2 22.2 22.1 21.8 20.7 20.7L20.3 23C20.3 23 21.8 23.8 24 23.8C26.2 23.8 29.9 22.5 29.9 19.3C29.9 16 25.3 15.7 25.3 14.3C25.3 12.9 28.5 13.1 30 14Z" fill="white"/>
    </svg>
    {/* Mastercard */}
    <svg viewBox="0 0 48 32" className="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#252525"/>
      <circle cx="19" cy="16" r="9" fill="#EB001B"/>
      <circle cx="29" cy="16" r="9" fill="#F79E1B"/>
      <path d="M24 9.3A9 9 0 0 1 27.5 16 9 9 0 0 1 24 22.7 9 9 0 0 1 20.5 16 9 9 0 0 1 24 9.3Z" fill="#FF5F00"/>
    </svg>
    {/* Apple Pay */}
    <svg viewBox="0 0 48 32" className="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#000"/>
      <path d="M15.2 10.8C15.7 10.2 16 9.4 15.9 8.6C15.2 8.7 14.3 9.1 13.8 9.7C13.3 10.2 12.9 11.1 13 11.8C13.8 11.9 14.6 11.4 15.2 10.8ZM15.9 12C14.9 11.9 14 12.5 13.5 12.5C13 12.5 12.2 12 11.4 12C10.3 12 9.3 12.6 8.7 13.6C7.5 15.6 8.4 18.5 9.6 20.2C10.2 21 10.9 21.9 11.8 21.9C12.6 21.9 12.9 21.4 13.9 21.4C14.9 21.4 15.1 21.9 16 21.9C16.9 21.9 17.5 21.1 18.1 20.2C18.8 19.2 19.1 18.3 19.1 18.2C19.1 18.2 17.4 17.5 17.4 15.6C17.4 13.9 18.8 13.2 18.8 13.1C18 12.1 16.7 12 15.9 12ZM24.4 9.5V21.8H26.2V17.6H28.8C31.1 17.6 32.8 16 32.8 13.5C32.8 11.1 31.1 9.5 28.9 9.5H24.4ZM26.2 11.1H28.4C30 11.1 30.9 12 30.9 13.5C30.9 15.1 30 16 28.4 16H26.2V11.1ZM36 21.9C37.2 21.9 38.4 21.3 38.9 20.3H39V21.8H40.6V15.9C40.6 14.1 39.2 13 37 13C35 13 33.4 14.1 33.4 15.7H34.9C35.1 14.9 35.9 14.4 37 14.4C38.3 14.4 39 15 39 16.1V16.8L36.6 17C34.5 17.1 33.3 18 33.3 19.5C33.3 21 34.5 21.9 36 21.9ZM36.5 20.5C35.4 20.5 34.8 20 34.8 19.2C34.8 18.4 35.4 18 36.7 17.9L39 17.7V18.4C39 19.6 37.9 20.5 36.5 20.5Z" fill="white"/>
    </svg>
    {/* Google Pay */}
    <svg viewBox="0 0 48 32" className="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
      <path d="M23.8 16.4V19.2H22.6V10.8H25.7C26.5 10.8 27.3 11.1 27.8 11.6C28.4 12.1 28.7 12.8 28.7 13.6C28.7 14.4 28.4 15.1 27.8 15.6C27.3 16.1 26.5 16.4 25.7 16.4H23.8ZM23.8 11.9V15.3H25.8C26.3 15.3 26.7 15.1 27 14.8C27.6 14.2 27.6 13.2 27 12.5C26.7 12.2 26.3 12 25.8 12L23.8 11.9Z" fill="#4285F4"/>
      <path d="M32.3 13.7C33.2 13.7 33.9 14 34.4 14.5C34.9 15 35.2 15.7 35.2 16.5V19.2H34.1V18.4H34C33.6 19 32.9 19.4 32.2 19.3C31.5 19.3 30.8 19.1 30.3 18.6C29.8 18.2 29.5 17.5 29.6 16.9C29.6 16.2 29.8 15.7 30.4 15.3C30.9 14.9 31.6 14.7 32.4 14.7C33.1 14.7 33.6 14.8 34 15.1V14.8C34 14.3 33.8 13.9 33.5 13.6C33.1 13.3 32.7 13.1 32.2 13.1C31.5 13.1 30.9 13.4 30.6 14L29.6 13.4C30.1 12.6 31 12.2 32 12.2L32.3 13.7ZM30.8 17C30.8 17.3 30.9 17.6 31.2 17.8C31.5 18 31.8 18.2 32.2 18.2C32.7 18.2 33.2 18 33.6 17.6C34 17.2 34.2 16.8 34.2 16.3C33.8 16 33.3 15.8 32.5 15.8C32 15.8 31.5 15.9 31.2 16.2C30.9 16.4 30.8 16.7 30.8 17Z" fill="#4285F4"/>
      <path d="M40.5 13.9L37 21.5H35.8L37 19L34.9 14H36.2L37.7 17.7L39.3 14H40.5V13.9Z" fill="#4285F4"/>
      <path d="M18.7 15.6C18.7 15.2 18.6 14.8 18.5 14.4H13.4V16.6H16.4C16.3 17.3 15.9 17.9 15.3 18.3V19.7H17.1C18.1 18.8 18.7 17.3 18.7 15.6Z" fill="#4285F4"/>
      <path d="M13.4 21C14.9 21 16.2 20.5 17.1 19.6L15.3 18.3C14.8 18.6 14.1 18.8 13.4 18.8C12 18.8 10.7 17.9 10.3 16.6H8.4V18.1C9.4 19.9 11.3 21 13.4 21Z" fill="#34A853"/>
      <path d="M10.3 16.6C10 15.9 10 15.1 10.3 14.4V12.9H8.4C7.5 14.5 7.5 16.5 8.4 18.1L10.3 16.6Z" fill="#FBBC04"/>
      <path d="M13.4 12.2C14.2 12.2 14.9 12.5 15.4 13L17.1 11.3C16.1 10.4 14.8 9.9 13.4 10C11.3 10 9.4 11.1 8.4 12.9L10.3 14.4C10.7 13.1 12 12.2 13.4 12.2Z" fill="#EA4335"/>
    </svg>
  </span>
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
