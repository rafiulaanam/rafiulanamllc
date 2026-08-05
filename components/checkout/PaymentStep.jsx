"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/currency";

export default function PaymentStep({ total }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      toast.error(error.message ?? "Payment failed");
      setIsSubmitting(false);
    }
    // On success, Stripe redirects to return_url — no further action here.
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold">Payment</h2>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : `Pay ${formatPrice(total)}`}
      </button>
    </form>
  );
}
