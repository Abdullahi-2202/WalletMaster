import { useState, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { ModalContext } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCardSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, X } from "lucide-react";
import { getCardGradient } from "@/lib/utils";

// Updated form schema with validation
const cardFormSchema = z.object({
  cardType: z.string().min(1, "Card type is required"),
  bankName: z.string().min(1, "Bank name is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format"),
  balance: z.coerce
    .number()
    .min(0, "Balance must be a positive number"),
  cardColor: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

export function AddCardModal() {
  const { setActiveModal } = useContext(ModalContext);
  const { toast } = useToast();
  const [cardPreviewColor, setCardPreviewColor] = useState("blue");

  // Form setup
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardType: "",
      bankName: "",
      cardNumber: "",
      expiryDate: "",
      balance: 0,
      cardColor: "blue",
      isDefault: false,
    },
  });

  // Watch card number to format in preview
  const cardNumber = form.watch("cardNumber");
  const formattedCardNumber = cardNumber
    ? `•••• •••• •••• ${cardNumber.slice(-4)}`
    : "•••• •••• •••• ••••";

  // Add Card Mutation
  const addCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      const res = await apiRequest("POST", "/api/cards", {
        ...data,
        lastFour: data.cardNumber.slice(-4),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "Your card has been successfully added.",
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

  return (
    <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Add New Card
          </DialogTitle>
        </DialogHeader>

        {/* Card Preview */}
        <div className={`rounded-xl p-4 flex flex-col justify-between h-44 bg-gradient-to-r ${getCardGradient(cardPreviewColor)} text-white mb-4 shadow-sm`}>
          <div className="flex justify-between">
            <div className="text-lg font-semibold">
              {form.watch("bankName") || "Bank Name"}
            </div>
            <div>
              {form.watch("cardType") === "visa" && <i className="fab fa-cc-visa text-2xl"></i>}
              {form.watch("cardType") === "mastercard" && <i className="fab fa-cc-mastercard text-2xl"></i>}
              {form.watch("cardType") === "amex" && <i className="fab fa-cc-amex text-2xl"></i>}
              {form.watch("cardType") === "discover" && <i className="fab fa-cc-discover text-2xl"></i>}
              {!form.watch("cardType") && <i className="fas fa-credit-card text-2xl"></i>}
            </div>
          </div>
          
          <div>
            <div className="text-sm opacity-80 mb-1">Card Number</div>
            <div className="font-medium">{formattedCardNumber}</div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <div className="text-sm opacity-80">Valid Thru</div>
              <div className="font-medium">{form.watch("expiryDate") || "MM/YY"}</div>
            </div>
            <div>
              <div className="text-sm opacity-80">CVV</div>
              <div className="font-medium">•••</div>
            </div>
            <div>
              <div className="text-sm opacity-80">Balance</div>
              <div className="font-medium">
                ${form.watch("balance")?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chase Bank" {...field} />
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
                          <SelectValue placeholder="Select type" />
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
            </div>

            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234 5678 9012 3456" 
                      {...field} 
                      maxLength={19}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
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
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cardColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Color</FormLabel>
                  <div className="flex space-x-2">
                    {["blue", "green", "purple", "orange", "red", "pink"].map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer ${
                          field.value === color ? "ring-2 ring-offset-2 ring-primary" : ""
                        } bg-gradient-to-r ${getCardGradient(color)}`}
                        onClick={() => {
                          field.onChange(color);
                          setCardPreviewColor(color);
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addCardMutation.isPending}
              >
                {addCardMutation.isPending ? "Adding Card..." : "Add Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
