"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

/* ---------------- Inner Form ---------------- */

function InnerCardForm({
  cartItems,
  total,
  formData,
}: {
  cartItems: any[];
  total: number;
  formData: any;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const auth = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<null | {
    order: any;
    paymentIntentId?: string;
    paymentStatus?: string;
    amount?: number;
  }>(null);

  const handlePay = async () => {
    if (!stripe || !elements || isProcessing) return;

    // Validate form
    if (!formData?.name || !formData?.email || !formData?.address || !formData?.phone) {
      alert("Please fill all required fields");
      return;
    }

    const token = auth?.token || localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login?next=/checkout");
      return;
    }

    setIsProcessing(true);

    try {
      // Amount in paise
      const amount = Math.round(total * 100);

      const paymentIntentRes = await api.createPaymentIntent(token, {
        amount,
        currency: "inr",
      });

      const clientSecret = paymentIntentRes?.clientSecret;
      if (!clientSecret) throw new Error("Client secret not received");

      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element missing");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (result.error) {
        alert(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        const orderPayload = {
          items: cartItems,
          total,
          payment: "card",
          paymentIntentId: result.paymentIntent.id,
          paymentStatus: result.paymentIntent.status,
          address: `${formData.address}, ${formData.city || ""}, ${formData.zipcode || ""}`,
          phone: formData.phone,
        };

        const order = await api.createOrder(token, orderPayload);

        localStorage.setItem("lastOrder", JSON.stringify(order));
        localStorage.setItem("cart", "[]");

        // show inline confirmation visual before navigating
        setPaymentSuccess({
          order,
          paymentIntentId: result.paymentIntent.id,
          paymentStatus: result.paymentIntent.status,
          amount: total,
        });
      } else {
        alert("Payment not completed");
      }
    } catch (error: any) {
      console.error("Stripe Payment Error:", error);
      alert(error?.message || "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="mt-4">
        <div className="p-6 border rounded-md bg-card">
          <h3 className="text-xl font-semibold mb-2">Payment Confirmed</h3>
          <p className="mb-1">Amount: <strong>₹{paymentSuccess.amount}</strong></p>
          <p className="mb-1">Transaction ID: <code>{paymentSuccess.paymentIntentId}</code></p>
          <p className="mb-4">Status: <span className="text-green-600 font-medium">{paymentSuccess.paymentStatus}</span></p>

          <div className="flex gap-2">
            <Button onClick={() => router.push(`/order-confirmation/${paymentSuccess.order.id}`)}>
              View Order
            </Button>
            <Button onClick={() => router.push("/")} variant="secondary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="p-4 border rounded-md bg-card">
        <label className="block text-sm font-medium mb-2">
          Card Details
        </label>

        <div className="p-3 bg-muted rounded">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                },
              },
            }}
          />
        </div>

        <Button
          onClick={handlePay}
          disabled={!stripe || isProcessing}
          className="mt-4 w-full"
        >
          {isProcessing ? "Processing..." : `Pay ₹${total}`}
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Wrapper ---------------- */

export default function CardPayment(props: any) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <p>Stripe key missing</p>;
  }

  return (
    <Elements stripe={stripePromise}>
      <InnerCardForm {...props} />
    </Elements>
  );
}