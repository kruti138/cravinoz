import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createRazorpayOrder, verifySignature } from '../services/razorpay.service';
import { prisma } from '../db';

const router = Router();

// Create Razorpay Order
router.post('/create-order', authenticate, async (req: any, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Missing or invalid amount' });
    }

    const order = await createRazorpayOrder(amount, currency);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err: any) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: err?.message || 'Razorpay error' });
  }
});

// Verify Razorpay Payment and Save Order
router.post('/verify', authenticate, async (req: any, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData 
    } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Save order in database after successful verification
    const { items, total, address, phone } = orderData;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        items: JSON.stringify(items),
        total,
        address,
        phone,
        payment: 'ONLINE',
        paymentStatus: 'PAID',
        status: 'PENDING',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    res.json({ 
      success: true, 
      message: 'Payment verified and order placed', 
      orderId: order.id 
    });
  } catch (err: any) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
});

export default router;
