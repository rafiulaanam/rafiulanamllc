"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { createCheckoutIntent } from "@/app/checkout/actions";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressForm from "@/components/checkout/AddressForm";
import PaymentStep from "@/components/checkout/PaymentStep";

const STEP_INDEX = { address: 0, payment: 1 };

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
      <p className="rounded-lg border border-clay/30 bg-clay/10 p-4 text-sm text-clay-dark">
        Stripe isn&apos;t configured yet — set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to enable
        checkout.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrderSummary items={items} totals={totals} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={STEP_INDEX[step]}>
          {step === "address" && (
            <motion.div
              key="address"
              custom={0}
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <AddressForm
                defaultEmail={defaultEmail}
                defaultName={defaultName}
                defaultAddress={defaultAddress}
                isLoggedIn={isLoggedIn}
                isSubmitting={isSubmitting}
                onSubmit={handleAddressSubmit}
              />
            </motion.div>
          )}

          {step === "payment" && clientSecret && (
            <motion.div
              key="payment"
              custom={1}
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentStep total={totals.total} onBack={() => setStep("address")} />
              </Elements>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
