import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_id.startsWith('rzp_')) {
  console.error('RAZORPAY_KEY_ID is missing or invalid in .env');
}
if (!key_secret) {
  console.error('RAZORPAY_KEY_SECRET is missing in .env');
}

export const razorpay = new Razorpay({
  key_id: key_id || '',
  key_secret: key_secret || '',
});

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

export const verifySignature = (orderId: string, paymentId: string, signature: string) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret || '')
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === signature;
};
