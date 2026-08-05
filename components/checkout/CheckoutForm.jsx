"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { createCheckoutIntent } from "@/app/checkout/actions";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressForm from "@/components/checkout/AddressForm";
import PaymentStep from "@/components/checkout/PaymentStep";

export default function CheckoutForm({
  items,
  subtotal,
  publishableKey,
  defaultEmail,
  defaultName,
  defaultAddress,
  isLoggedIn,
}) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  const [step, setStep] = useState("address");
  const [clientSecret, setClientSecret] = useState(null);
  const [totals, setTotals] = useState({ subtotal, tax: 0, shipping: 0, total: subtotal });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressSubmit = async (address) => {
    setIsSubmitting(true);
    try {
      const result = await createCheckoutIntent(address);
      setClientSecret(result.clientSecret);
      setTotals(result);
      setStep("payment");
    } catch (error) {
      toast.error(error.message ?? "Could not start checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!publishableKey) {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        Stripe isn&apos;t configured yet — set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to enable
        checkout.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrderSummary items={items} totals={totals} />

      {step === "address" && (
        <AddressForm
          defaultEmail={defaultEmail}
          defaultName={defaultName}
          defaultAddress={defaultAddress}
          isLoggedIn={isLoggedIn}
          isSubmitting={isSubmitting}
          onSubmit={handleAddressSubmit}
        />
      )}

      {step === "payment" && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentStep total={totals.total} />
        </Elements>
      )}
    </div>
  );
}
