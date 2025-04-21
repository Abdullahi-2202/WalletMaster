import { PaymentGateway } from './index';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class StripeGateway implements PaymentGateway {
  name = 'Stripe';
  id = 'stripe';

  async createPayment(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment creation error:', error);
      throw error;
    }
  }

  async processPayment(paymentId: string, paymentMethodId?: string) {
    try {
      // If a payment method ID is provided, attach it to the payment intent
      if (paymentMethodId) {
        await stripe.paymentIntents.confirm(paymentId, {
          payment_method: paymentMethodId,
        });
      }
      
      // Get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        transactionId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        error: error.message
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentId,
      };
      
      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }
      
      const refund = await stripe.refunds.create(refundParams);
      
      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Additional Stripe-specific methods
  async createCustomer(email: string, name: string, metadata: Record<string, string> = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });
      
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async createTransfer(amount: number, destinationAccount: string, description: string) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: destinationAccount,
        description,
      });
      
      return {
        id: transfer.id,
        amount: transfer.amount / 100, // Convert back to dollars
      };
    } catch (error) {
      console.error('Error creating Stripe transfer:', error);
      throw error;
    }
  }
}