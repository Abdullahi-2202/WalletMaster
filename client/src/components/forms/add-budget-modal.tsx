import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { ModalContext } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CategoryType } from "@/types";
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
import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Budget form schema
const budgetFormSchema = z.object({
  categoryId: z.coerce.number().min(1, "Category is required"),
  amount: z.coerce
    .number()
    .min(1, "Amount must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"], {
    required_error: "Period is required",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface AddBudgetModalProps {
  categories: CategoryType[];
}

export function AddBudgetModal({ categories }: AddBudgetModalProps) {
  const { setActiveModal } = useContext(ModalContext);
  const { toast } = useToast();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Form setup
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: 0,
      amount: 0,
      period: "monthly",
      startDate: today,
      endDate: "",
    },
  });

  // Add Budget Mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      // Parse dates to ISO strings
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      };
      
      const res = await apiRequest("POST", "/api/budgets", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget Created",
        description: "Your budget has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setActiveModal(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: BudgetFormValues) => {
    addBudgetMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Create New Budget
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            {category.name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
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
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Preview */}
            {form.watch("categoryId") > 0 && form.watch("amount") > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Preview</h3>
                <div className="flex items-center mb-2">
                  {(() => {
                    const selectedCategory = categories.find(
                      (c) => c.id === Number(form.watch("categoryId"))
                    );
                    return selectedCategory ? (
                      <>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                          style={{
                            backgroundColor: `${selectedCategory.color}20`,
                            color: selectedCategory.color,
                          }}
                        >
                          <i className={`fas fa-${selectedCategory.icon} text-xs`}></i>
                        </div>
                        <span className="font-medium">{selectedCategory.name}</span>
                      </>
                    ) : null;
                  })()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {form.watch("period").charAt(0).toUpperCase() + form.watch("period").slice(1)} Budget:
                  </span>
                  <span className="font-medium">{formatCurrency(form.watch("amount"))}</span>
                </div>
              </div>
            )}

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
                disabled={addBudgetMutation.isPending}
              >
                {addBudgetMutation.isPending ? "Creating Budget..." : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
