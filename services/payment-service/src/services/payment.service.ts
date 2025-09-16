// src/services/payment.service.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent } from '../events/publisher';
import { log, error } from '../utils/logger';

type PaymentResult = {
  success: boolean;
  providerId?: string;
  message?: string;
};

/**
 * Simulate calling a payment provider.
 * In production replace with Stripe SDK call.
 */
export const processPayment = async (orderId: string, amount: number, paymentMethod: any): Promise<PaymentResult> => {
  log('Processing payment for order', orderId, 'amount', amount);
  // Simulate network latency + decision
  await new Promise((r) => setTimeout(r, 600));

  // Simple random success/failure deterministic-ish: succeed 90% of time
  const ok = Math.random() < 0.9;
  if (!ok) {
    return { success: false, message: 'Payment declined by provider' };
  }

  // simulate provider transaction id
  return { success: true, providerId: 'pay_' + uuidv4() };
};

/**
 * Handle payment flow:
 * 1. process payment via provider (mock)
 * 2. on success -> update order status via Order Service and publish OrderPaid event
 * 3. on failure -> publish PaymentFailed event
 */
export const handlePayment = async (orderId: string, amount: number, paymentMethod: any) => {
  try {
    const result = await processPayment(orderId, amount, paymentMethod);

    if (!result.success) {
      // publish failure event
      await publishEvent('payment.failed', {
        event: 'PaymentFailed',
        data: { orderId, amount, reason: result.message }
      });
      return { success: false, reason: result.message };
    }
 console.log("Order service token:", process.env.ORDER_SERVICE_AUTH_TOKEN?.slice(0, 10) + "...");

 try{
    // on success, call order service to mark PAID (server-to-server)
    const response =  await axios.patch(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
      status: 'PAID'
    }, {
        headers: {
            Authorization: `Bearer ${process.env.ORDER_SERVICE_AUTH_TOKEN}`, 
        },
      timeout: 5000
    });
    console.log("Order details:", response.data);
  }
  catch (err:any) {
    console.error("PATCH failed", err.response?.status, err.response?.data);
  } 
    await publishEvent('payment.processed', {
      event: 'PaymentProcessed',
      data: { orderId, amount, providerId: result.providerId }
    });
   
    // For compatibility with other services (OrderPaid event name)
    await publishEvent('order.paid', {
      event: 'OrderPaid',
      data: { orderId, amount, providerId: result.providerId }
    });
 
    return { success: true, providerId: result.providerId };
  } catch (err: any) {
    error('Error processing payment', err?.message || err);
    // publish failure
    await publishEvent('payment.failed', {
      event: 'PaymentFailed',
      data: { orderId, amount, reason: err?.message || 'unknown' }
    });
    return { success: false, reason: err?.message || 'error' };
  }
};
