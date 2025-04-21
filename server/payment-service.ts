import Stripe from 'stripe';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export class PaymentService {
  /**
   * Creates a payment intent for processing payments
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment creation error:', error);
      throw error;
    }
  }

  /**
   * Creates a Stripe customer
   */
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

  /**
   * Creates a Stripe transfer (for payouts)
   */
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

  /**
   * Process a payment with Stripe
   */
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

  /**
   * Refund a payment
   */
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

  /**
   * Set up a payment method for future use
   */
  async setupPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      // Set it as the default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      return {
        success: true,
        customerId,
        paymentMethodId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a subscription for recurring payments
   */
  async createSubscription(customerId: string, priceId: string, metadata: Record<string, string> = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          { price: priceId },
        ],
        metadata,
        expand: ['latest_invoice.payment_intent'],
      });
      
      return {
        id: subscription.id,
        status: subscription.status,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      };
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * List saved payment methods for a customer
   */
  async listPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      
      return paymentMethods.data.map(method => ({
        id: method.id,
        type: method.type,
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
      }));
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();