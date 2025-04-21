import { PaymentGateway } from './index';
import { v4 as uuidv4 } from 'uuid';

// Mock gateway for testing payment flows without actual payments
export class MockGateway implements PaymentGateway {
  name = 'Test Gateway';
  id = 'mock';
  
  // In-memory storage for payments
  private payments: Record<string, {
    id: string;
    amount: number;
    currency: string;
    status: string;
    metadata: Record<string, string>;
    createdAt: Date;
  }> = {};
  
  // In-memory storage for refunds
  private refunds: Record<string, {
    id: string;
    paymentId: string;
    amount?: number;
    status: string;
    createdAt: Date;
  }> = {};

  async createPayment(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    const id = `mock_payment_${uuidv4()}`;
    
    this.payments[id] = {
      id,
      amount,
      currency,
      status: 'pending',
      metadata,
      createdAt: new Date()
    };
    
    // Mock client secret for frontend
    const clientSecret = `${id}_secret_${uuidv4()}`;
    
    return {
      id,
      clientSecret,
      status: 'pending'
    };
  }

  async processPayment(paymentId: string, paymentMethodId?: string) {
    if (!this.payments[paymentId]) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment not found'
      };
    }
    
    // Simulate payment processing
    // Fail payments with amount ending in .99 for testing error handling
    const payment = this.payments[paymentId];
    const shouldFail = payment.amount.toString().endsWith('.99');
    
    if (shouldFail) {
      payment.status = 'failed';
      return {
        success: false,
        status: 'failed',
        transactionId: paymentId,
        error: 'Mock payment failure'
      };
    }
    
    // Success case
    payment.status = 'succeeded';
    return {
      success: true,
      status: 'succeeded',
      transactionId: paymentId
    };
  }

  async refundPayment(paymentId: string, amount?: number) {
    if (!this.payments[paymentId]) {
      return {
        success: false,
        error: 'Payment not found'
      };
    }
    
    if (this.payments[paymentId].status !== 'succeeded') {
      return {
        success: false,
        error: 'Cannot refund a payment that has not succeeded'
      };
    }
    
    const refundId = `mock_refund_${uuidv4()}`;
    
    this.refunds[refundId] = {
      id: refundId,
      paymentId,
      amount,
      status: 'succeeded',
      createdAt: new Date()
    };
    
    return {
      success: true,
      refundId
    };
  }

  // Method to reset all mock data (for testing)
  resetMockData() {
    this.payments = {};
    this.refunds = {};
  }
  
  // Helper method to get a payment (for testing)
  getPayment(paymentId: string) {
    return this.payments[paymentId];
  }
  
  // Helper method to get a refund (for testing)
  getRefund(refundId: string) {
    return this.refunds[refundId];
  }
}