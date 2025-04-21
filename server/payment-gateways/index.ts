// Payment Gateway Interface
export interface PaymentGateway {
  name: string;
  id: string;
  createPayment(amount: number, currency: string, metadata: Record<string, string>): Promise<{
    id: string;
    clientSecret?: string;
    redirectUrl?: string;
    status: string;
  }>;
  processPayment(paymentId: string, paymentMethodId?: string): Promise<{
    success: boolean;
    status: string;
    transactionId?: string;
    error?: string;
  }>;
  refundPayment(paymentId: string, amount?: number): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }>;
}

// Gateway Registry
import { StripeGateway } from './stripe-gateway';
import { PayPalGateway } from './paypal-gateway';
import { MockGateway } from './mock-gateway';

// Available payment gateways
const availableGateways: Record<string, PaymentGateway> = {
  stripe: new StripeGateway(),
  paypal: new PayPalGateway(),
  mock: new MockGateway() // For testing without real payment providers
};

// Get a specific gateway by ID
export function getGateway(gatewayId: string): PaymentGateway {
  const gateway = availableGateways[gatewayId];
  if (!gateway) {
    throw new Error(`Payment gateway "${gatewayId}" not found`);
  }
  return gateway;
}

// Get all available gateways
export function getAvailableGateways(): PaymentGateway[] {
  return Object.values(availableGateways);
}

// Default gateway (used when no specific gateway is requested)
export function getDefaultGateway(): PaymentGateway {
  return availableGateways.stripe; 
}