import { PaymentGateway } from './index';

// PayPal gateway implementation
export class PayPalGateway implements PaymentGateway {
  name = 'PayPal';
  id = 'paypal';
  private baseUrl = 'https://api-m.sandbox.paypal.com'; // Use sandbox for testing
  private clientId = process.env.PAYPAL_CLIENT_ID || '';
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  private accessToken = '';
  private tokenExpiry = 0;

  constructor() {
    // Check if PayPal credentials are available
    if (!this.clientId || !this.clientSecret) {
      console.warn('PayPal credentials not configured. PayPal gateway will be unavailable.');
    }
  }

  // Helper method to get access token
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Request new access token
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`PayPal API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  async createPayment(amount: number, currency: string = 'USD', metadata: Record<string, string> = {}) {
    try {
      // Verify PayPal credentials are set
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal API credentials are not configured');
      }

      const token = await this.getAccessToken();
      
      // Create PayPal order
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2)
            },
            description: metadata.description || 'Payment',
            custom_id: metadata.userId || undefined
          }],
          application_context: {
            return_url: metadata.returnUrl || 'https://example.com/success',
            cancel_url: metadata.cancelUrl || 'https://example.com/cancel'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Find approval URL for redirect
      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;
      
      return {
        id: data.id,
        redirectUrl: approvalUrl,
        status: data.status
      };
    } catch (error: any) {
      console.error('PayPal payment creation error:', error);
      throw error;
    }
  }

  async processPayment(paymentId: string) {
    try {
      // Verify PayPal credentials are set
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal API credentials are not configured');
      }

      const token = await this.getAccessToken();
      
      // Capture the approved PayPal order
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          status: 'failed',
          error: errorData.message || 'Failed to capture payment'
        };
      }

      const data = await response.json();
      
      return {
        success: data.status === 'COMPLETED',
        status: data.status,
        transactionId: data.purchase_units[0]?.payments?.captures[0]?.id
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
      // Verify PayPal credentials are set
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal API credentials are not configured');
      }

      const token = await this.getAccessToken();
      
      // Create a refund
      const body: any = {};
      if (amount) {
        body.amount = {
          value: amount.toFixed(2),
          currency_code: 'USD'
        };
      }
      
      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to refund payment'
        };
      }

      const data = await response.json();
      
      return {
        success: data.status === 'COMPLETED',
        refundId: data.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}