import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, RefreshCw, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CardType } from "@/types";
import { useStripe, useElements, PaymentElement, Elements, AddressElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("utility");
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      
      <Tabs defaultValue="utility" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="utility">
            <Zap className="mr-2 h-4 w-4" />
            Pay Utilities
          </TabsTrigger>
          <TabsTrigger value="add-funds">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Funds
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Transfer Money
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="utility">
          <UtilityPaymentForm />
        </TabsContent>
        
        <TabsContent value="add-funds">
          <AddFundsForm />
        </TabsContent>
        
        <TabsContent value="transfer">
          <TransferMoneyForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Utility Payment Form
function UtilityPaymentForm() {
  const { toast } = useToast();
  const [utilityName, setUtilityName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("2"); // Default to Bills category
  
  // Fetch user's cards
  const { data: cards, isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
    staleTime: 10000,
  });
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    staleTime: 30000,
  });
  
  // Pay utility mutation
  const payUtilityMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const res = await apiRequest("POST", "/api/payments/pay-utility", paymentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: `Successfully paid ${utilityName}`,
      });
      
      // Reset form
      setUtilityName("");
      setAmount("");
      setDescription("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!utilityName || !amount || !selectedCardId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    payUtilityMutation.mutate({
      cardId: selectedCardId,
      amount: parseFloat(amount),
      utilityName,
      utilityCategory: parseInt(categoryId),
      description,
    });
  };
  
  if (isLoadingCards || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cards Available</CardTitle>
          <CardDescription>
            You need to add a card before you can make utility payments.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Add a Card
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Utility Bills</CardTitle>
        <CardDescription>
          Pay your utility bills directly from your card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utilityName">Utility Provider</Label>
            <Input
              id="utilityName"
              placeholder="e.g. Electric Company, Water Service"
              value={utilityName}
              onChange={(e) => setUtilityName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card">Pay From</Label>
            <Select 
              value={selectedCardId} 
              onValueChange={setSelectedCardId}
            >
              <SelectTrigger id="card">
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id.toString()}>
                    {card.bankName} •••• {card.lastFour} ({formatCurrency(card.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: { id: number; name: string }) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Monthly electric bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={payUtilityMutation.isPending}
          >
            {payUtilityMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Pay Bill
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Add Funds Form
function AddFundsForm() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Fetch user's cards
  const { data: cards, isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
    staleTime: 10000,
  });
  
  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const res = await apiRequest("POST", "/api/payments/create-intent", data);
      return res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });
  
  const handleProceed = () => {
    if (!amount || !selectedCardId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createPaymentIntentMutation.mutate({
      amount: parseFloat(amount),
    });
  };
  
  if (isLoadingCards) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cards Available</CardTitle>
          <CardDescription>
            You need to add a card before you can add funds.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Add a Card
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentForm 
          amount={parseFloat(amount)} 
          cardId={parseInt(selectedCardId)} 
          onSuccess={() => {
            setClientSecret("");
            setAmount("");
            setSelectedCardId("");
            queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
          }}
          onCancel={() => {
            setClientSecret("");
            setProcessing(false);
          }}
        />
      </Elements>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Funds to Card</CardTitle>
        <CardDescription>
          Add funds to your cards from external payment methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card">Add To</Label>
            <Select 
              value={selectedCardId} 
              onValueChange={setSelectedCardId}
            >
              <SelectTrigger id="card">
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id.toString()}>
                    {card.bankName} •••• {card.lastFour} ({formatCurrency(card.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleProceed} 
            disabled={createPaymentIntentMutation.isPending}
          >
            {createPaymentIntentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Continue to Payment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Stripe Payment Form for Add Funds
function StripePaymentForm({ amount, cardId, onSuccess, onCancel }: { 
  amount: number; 
  cardId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (data: { 
      cardId: number; 
      amount: number;
      paymentMethodId: string;
    }) => {
      const res = await apiRequest("POST", "/api/payments/add-funds", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added",
        description: `Successfully added ${formatCurrency(amount)} to your card`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive",
      });
      setProcessing(false);
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    
    if (result.error) {
      toast({
        title: "Payment Failed",
        description: result.error.message || "An error occurred during payment",
        variant: "destructive",
      });
      setProcessing(false);
    } else {
      // Payment succeeded, add funds to the card
      addFundsMutation.mutate({
        cardId,
        amount,
        paymentMethodId: result.paymentIntent.payment_method as string,
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Enter your payment details to add {formatCurrency(amount)} to your card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Transfer Money Form
function TransferMoneyForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [description, setDescription] = useState("");
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  
  // Fetch user's cards
  const { data: cards, isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
    staleTime: 10000,
  });
  
  // Transfer money mutation
  const transferMoneyMutation = useMutation({
    mutationFn: async (transferData: any) => {
      const res = await apiRequest("POST", "/api/payments/transfer", transferData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer Successful",
        description: `Successfully transferred ${formatCurrency(parseFloat(amount))}`,
      });
      
      // Reset form
      setRecipientEmail("");
      setAmount("");
      setDescription("");
      setRecipientId(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer money",
        variant: "destructive",
      });
    },
  });
  
  // Find user by email
  const findUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("GET", `/api/users/find?email=${encodeURIComponent(email)}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data && data.id) {
        setRecipientId(data.id);
        toast({
          title: "Recipient Found",
          description: `${data.firstName} ${data.lastName}`,
        });
      } else {
        toast({
          title: "Recipient Not Found",
          description: "No user found with that email",
          variant: "destructive",
        });
      }
      setSearchingUser(false);
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to find user",
        variant: "destructive",
      });
      setSearchingUser(false);
    },
  });
  
  const handleFindUser = () => {
    if (!recipientEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter recipient's email",
        variant: "destructive",
      });
      return;
    }
    
    setSearchingUser(true);
    findUserMutation.mutate(recipientEmail);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId || !amount || !selectedCardId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    transferMoneyMutation.mutate({
      recipientId,
      cardId: selectedCardId,
      amount: parseFloat(amount),
      description,
    });
  };
  
  if (isLoadingCards) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cards Available</CardTitle>
          <CardDescription>
            You need to add a card before you can transfer money.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Add a Card
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <CardDescription>
          Send money to other Wallet Master users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <div className="flex gap-2">
              <Input
                id="recipientEmail"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                disabled={!!recipientId}
              />
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleFindUser}
                disabled={!recipientEmail || !!recipientId || searchingUser}
              >
                {searchingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Find"
                )}
              </Button>
            </div>
          </div>
          
          {recipientId && (
            <Badge className="mb-2">Recipient found ✓</Badge>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                className="pl-8"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card">Transfer From</Label>
            <Select 
              value={selectedCardId} 
              onValueChange={setSelectedCardId}
            >
              <SelectTrigger id="card">
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id.toString()}>
                    {card.bankName} •••• {card.lastFour} ({formatCurrency(card.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Paying you back for lunch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!recipientId || transferMoneyMutation.isPending}
          >
            {transferMoneyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Transfer Money
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}