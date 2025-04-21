import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ModalContext } from "@/App";
import { useToast } from "@/hooks/use-toast";

// Form schema validation
const cardFormSchema = z.object({
  bankName: z.string().min(2, { message: "Bank name is required" }),
  cardType: z.string().min(1, { message: "Card type is required" }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be at least 16 characters" })
    .max(19, { message: "Card number must not exceed 19 characters" }),
  expiryDate: z.string().min(5, { message: "Valid expiry date is required" }),
  balance: z.coerce.number().min(0, { message: "Balance must be a positive number" }),
  cardColor: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

// Available card colors
const cardColors = [
  { name: "Blue", value: "blue" },
  { name: "Purple", value: "purple" },
  { name: "Green", value: "green" },
  { name: "Red", value: "red" },
  { name: "Orange", value: "orange" },
  { name: "Teal", value: "teal" },
  { name: "Gray", value: "gray" },
];

export function AddCardModal() {
  const { setActiveModal } = useContext(ModalContext);
  const { toast } = useToast();
  
  // Set up form with default values
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      bankName: "",
      cardType: "",
      cardNumber: "",
      expiryDate: "",
      balance: 0,
      cardColor: "blue",
      isDefault: false,
    },
  });
  
  // Create mutation for adding a card
  const addCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      // Convert card number to last four digits
      const lastFour = data.cardNumber.slice(-4);
      
      const payload = {
        ...data,
        lastFour,
      };
      
      const res = await apiRequest("POST", "/api/cards", payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "Your card was successfully added",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setActiveModal(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add card. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: CardFormValues) => {
    addCardMutation.mutate(data);
  };
  
  // Handle close
  const handleClose = () => {
    setActiveModal(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Card</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                        <SelectItem value="discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="•••• •••• •••• ••••" 
                        {...field} 
                        maxLength={19}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be stored securely. Only the last 4 digits will be displayed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} maxLength={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Color</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select card color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cardColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: color.value }}
                              ></div>
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default</FormLabel>
                      <FormDescription>
                        Make this your default payment card?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCardMutation.isPending}
                >
                  {addCardMutation.isPending ? "Adding..." : "Add Card"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}