import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CreditCard, BanknoteIcon, SendIcon, Receipt, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentTab, setPaymentTab] = useState('add-funds');
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [utilityName, setUtilityName] = useState('');
  const [utilityCategory, setUtilityCategory] = useState('2'); // Default to Bills category
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipient, setRecipient] = useState<any>(null);
  const [recipientFound, setRecipientFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Fetch user's cards
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/cards'],
    enabled: !!user,
  });

  // Fetch categories for utility bills
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Handle amount input with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle searching for recipient
  const handleSearchRecipient = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await apiRequest('GET', `/api/users/find?email=${encodeURIComponent(recipientEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecipient(data);
        setRecipientFound(true);
        toast({
          title: 'Recipient found',
          description: `Found user: ${data.firstName} ${data.lastName}`,
        });
      } else {
        setRecipient(null);
        setRecipientFound(false);
        toast({
          title: 'Recipient not found',
          description: 'No user found with that email address',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error finding recipient:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for recipient',
        variant: 'destructive',
      });
    }
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!selectedCard || !amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Missing information',
        description: 'Please select a card and enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      let endpoint = '';
      let payload: any = {
        cardId: selectedCard,
        amount: parseFloat(amount),
        description,
      };

      switch (paymentTab) {
        case 'add-funds':
          endpoint = '/api/payments/add-funds';
          payload.paymentMethodId = 'pm_card_visa'; // Simulated payment method for demo
          break;
        case 'pay-utility':
          if (!utilityName) {
            throw new Error('Please enter a utility name');
          }
          endpoint = '/api/payments/pay-utility';
          payload.utilityName = utilityName;
          payload.utilityCategory = parseInt(utilityCategory);
          break;
        case 'transfer':
          if (!recipient) {
            throw new Error('Please select a recipient');
          }
          endpoint = '/api/payments/transfer';
          payload.recipientId = recipient.id;
          break;
      }

      const response = await apiRequest('POST', endpoint, payload);
      
      if (response.ok) {
        const result = await response.json();
        setPaymentResult(result);
        toast({
          title: 'Payment successful',
          description: 'Your transaction has been processed',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Payment processing failed');
      }
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear form when changing tabs
  useEffect(() => {
    setAmount('');
    setDescription('');
    setPaymentResult(null);
    
    // Reset tab-specific fields
    if (paymentTab === 'pay-utility') {
      setUtilityName('');
      setUtilityCategory('2');
    } else if (paymentTab === 'transfer') {
      setRecipientEmail('');
      setRecipient(null);
      setRecipientFound(false);
    }
  }, [paymentTab]);

  if (cardsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Make a Payment</CardTitle>
              <CardDescription>
                Choose an operation type to begin your transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="add-funds" onValueChange={setPaymentTab} value={paymentTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="add-funds" className="flex items-center gap-2">
                    <BanknoteIcon className="w-4 h-4" /> Add Funds
                  </TabsTrigger>
                  <TabsTrigger value="pay-utility" className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Pay Utility
                  </TabsTrigger>
                  <TabsTrigger value="transfer" className="flex items-center gap-2">
                    <SendIcon className="w-4 h-4" /> Transfer
                  </TabsTrigger>
                </TabsList>
                
                {/* Common fields for all payment types */}
                <div className="space-y-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="card">Select Card</Label>
                    <Select value={selectedCard} onValueChange={setSelectedCard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a card" />
                      </SelectTrigger>
                      <SelectContent>
                        {cards && Array.isArray(cards) ? cards.map((card: any) => (
                          <SelectItem key={card.id} value={card.id.toString()}>
                            {card.nickname} (*{card.lastFour}) - Balance: ${parseFloat(card.balance).toFixed(2)}
                          </SelectItem>
                        )) : <SelectItem value="no-cards">No cards available</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="amount"
                        className="pl-6"
                        placeholder="0.00"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tab-specific content */}
                <TabsContent value="add-funds" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Add funds to my card"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pay-utility" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="utilityName">Utility Name</Label>
                    <Input
                      id="utilityName"
                      placeholder="Electric Company"
                      value={utilityName}
                      onChange={(e) => setUtilityName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={utilityCategory} onValueChange={setUtilityCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && Array.isArray(categories) ? categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        )) : <SelectItem value="2">Bills</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Monthly electricity bill"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="transfer" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Email</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="recipient"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSearchRecipient}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                  
                  {recipientFound && (
                    <div className="p-3 border rounded-md bg-primary/5 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{recipient.firstName} {recipient.lastName}</p>
                        <p className="text-sm text-muted-foreground">{recipientEmail}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Thanks for dinner!"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubmitPayment}
                disabled={isProcessing || !selectedCard || !amount || (paymentTab === 'pay-utility' && !utilityName) || (paymentTab === 'transfer' && !recipientFound)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentTab === 'add-funds' && 'Add Funds'}
                    {paymentTab === 'pay-utility' && 'Pay Bill'}
                    {paymentTab === 'transfer' && 'Send Money'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Your recent transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentResult ? (
                <div className="space-y-3">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-center">Transaction Successful</h3>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    
                    {paymentTab === 'add-funds' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New Balance:</span>
                        <span className="font-medium">${parseFloat(paymentResult.card.balance).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {paymentTab === 'pay-utility' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid to:</span>
                        <span className="font-medium">{utilityName}</span>
                      </div>
                    )}
                    
                    {paymentTab === 'transfer' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-medium">{recipient.firstName} {recipient.lastName}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-medium text-xs truncate max-w-[120px]">
                        {paymentTab === 'add-funds' && paymentResult.transaction.id}
                        {paymentTab === 'pay-utility' && paymentResult.transaction.id}
                        {paymentTab === 'transfer' && paymentResult.senderTransaction.id}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Transaction information will appear here once a payment is completed</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Add Funds: Add money to your selected card</li>
                  <li>• Pay Utility: Pay your bills directly from your card</li>
                  <li>• Transfer: Send money to other Wallet Master users</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}