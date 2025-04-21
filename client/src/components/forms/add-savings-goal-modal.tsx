import { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ModalContext } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank } from "lucide-react";
import { formatCurrency, formatPercentage, calculatePercentage } from "@/lib/utils";

// Savings goal form schema
const savingsGoalFormSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce
    .number()
    .min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce
    .number()
    .min(0, "Current amount cannot be negative"),
  targetDate: z.string().optional(),
}).refine(data => {
  return data.currentAmount <= data.targetAmount;
}, {
  message: "Current amount cannot exceed target amount",
  path: ["currentAmount"],
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalFormSchema>;

export function AddSavingsGoalModal() {
  const { setActiveModal } = useContext(ModalContext);
  const { toast } = useToast();
  const [percentage, setPercentage] = useState(0);
  
  // Form setup
  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
    },
  });

  // Watch values to update percentage
  const targetAmount = form.watch("targetAmount");
  const currentAmount = form.watch("currentAmount");

  // Update percentage when values change
  if (targetAmount > 0 && currentAmount >= 0) {
    const newPercentage = calculatePercentage(currentAmount, targetAmount);
    if (newPercentage !== percentage) {
      setPercentage(newPercentage);
    }
  }

  // Add Savings Goal Mutation
  const addSavingsGoalMutation = useMutation({
    mutationFn: async (data: SavingsGoalFormValues) => {
      // Format the data
      const formattedData = {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
      };
      
      const res = await apiRequest("POST", "/api/savings-goals", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Savings Goal Created",
        description: "Your savings goal has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      setActiveModal(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SavingsGoalFormValues) => {
    addSavingsGoalMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PiggyBank className="mr-2 h-5 w-5" />
            Create Savings Goal
          </DialogTitle>
        </DialogHeader>

        {/* Goal Preview */}
        {form.watch("name") && form.watch("targetAmount") > 0 && (
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-800">{form.watch("name")}</h3>
                <div className="text-sm text-gray-500">
                  {formatCurrency(form.watch("currentAmount"))} of {formatCurrency(form.watch("targetAmount"))}
                </div>
              </div>
              {form.watch("targetDate") && (
                <span className="text-xs font-medium text-gray-500">
                  {new Date(form.watch("targetDate")).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
            <Progress value={percentage} className="h-2 mb-1" />
            <div className="text-xs text-gray-500 text-right">
              {formatPercentage(percentage)} Complete
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Vacation Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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

              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Savings</FormLabel>
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
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-blue-50 rounded-lg mt-2">
              <div className="flex items-start">
                <div className="bg-primary rounded-full w-6 h-6 flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <i className="fas fa-lightbulb text-xs"></i>
                </div>
                <p className="text-sm text-gray-700">
                  Setting a target date helps you stay motivated and track your progress towards your financial goal.
                </p>
              </div>
            </div>

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
                disabled={addSavingsGoalMutation.isPending}
              >
                {addSavingsGoalMutation.isPending ? "Creating Goal..." : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
