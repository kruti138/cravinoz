import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';

const router = Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment routes will fail until configured.');
}

const stripe = new Stripe(stripeSecret || '', { apiVersion: '2022-11-15' } as any);

// Create a PaymentIntent for the given amount (amount in smallest currency unit, e.g., paise)
router.post('/create-payment-intent', authenticate, async (req: any, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    if (!amount || typeof amount !== 'number') return res.status(400).json({ message: 'Missing or invalid amount' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: 'Order Payment for Cravinoz',
      metadata: { userId: req.user.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe create payment intent error', err);
    res.status(500).json({ message: err?.message || 'Stripe error' });
  }
});

export default router;
