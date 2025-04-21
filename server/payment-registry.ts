import { PaymentGateway } from './payment-gateways/index';
import { StripeGateway } from './payment-gateways/stripe-gateway';
import { paymentService } from './payment-service';

/**
 * Payment Registry provides unified access to payment functionality
 * As per user's request, we're focusing exclusively on Stripe
 */
class PaymentRegistry {
  private stripeGateway: StripeGateway;
  
  constructor() {
    // Initialize Stripe gateway
    this.stripeGateway = new StripeGateway();
  }
  
  /**
   * Get the payment service instance (Stripe-based implementation)
   */
  getPaymentService() {
    return paymentService;
  }
  
  /**
   * Get the gateway instance (Stripe only)
   */
  getGateway(): PaymentGateway {
    return this.stripeGateway;
  }
  
  /**
   * Create a payment intent
   */
  async createPaymentIntent(amount: number, currency = 'usd', metadata = {}) {
    return paymentService.createPaymentIntent(amount, currency, metadata);
  }
  
  /**
   * Process a payment
   */
  async processPayment(paymentId: string, paymentMethodId?: string) {
    return paymentService.processPayment(paymentId, paymentMethodId);
  }
  
  /**
   * Create a customer in Stripe
   */
  async createCustomer(email: string, name: string, metadata = {}) {
    return paymentService.createCustomer(email, name, metadata);
  }
  
  /**
   * Setup a payment method for future use
   */
  async setupPaymentMethod(customerId: string, paymentMethodId: string) {
    return paymentService.setupPaymentMethod(customerId, paymentMethodId);
  }
  
  /**
   * List payment methods for a customer
   */
  async listPaymentMethods(customerId: string) {
    return paymentService.listPaymentMethods(customerId);
  }
  
  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number) {
    return paymentService.refundPayment(paymentId, amount);
  }
}

// Export singleton instance
export const paymentRegistry = new PaymentRegistry();