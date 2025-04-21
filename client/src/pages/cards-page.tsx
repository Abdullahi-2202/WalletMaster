import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CreditCard, Plus, MoreHorizontal, Check } from "lucide-react";
import { formatCurrency, getCardGradient, getCardType } from "@/lib/utils";
import { CardType } from "@/types";
import { ModalContext } from "@/App";
import { AddCardModal } from "@/components/forms/add-card-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CardsPage() {
  const { user } = useAuth();
  const { activeModal, setActiveModal } = useContext(ModalContext);
  
  // Fetch cards
  const { data: cards = [], isLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });
  
  // Calculate total balance
  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance), 0);
  
  // Handle opening the add card modal
  const handleAddCard = () => {
    setActiveModal("addCard");
  };

  // If user not logged in, return empty fragment
  if (!user) return <></>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Card Management</h1>
            <Button className="flex items-center" onClick={handleAddCard}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
          
          {/* Balance Summary */}
          <Card className="shadow-sm mb-6">
            <CardContent className="pt-5 pb-5">
              <div className="text-center space-y-1">
                <div className="text-gray-500">Total Available Balance</div>
                {isLoading ? (
                  <div className="flex justify-center">
                    <Skeleton className="h-10 w-32" />
                  </div>
                ) : (
                  <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
                )}
                <div className="text-sm text-gray-500">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mx-auto" />
                  ) : (
                    `Across ${cards.length} Card${cards.length !== 1 ? 's' : ''}`
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cards Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Cards</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-48 shadow-sm">
                    <CardContent className="p-0">
                      <Skeleton className="h-full w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : cards.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="p-10 text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Cards Added</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    Add your debit and credit cards to track your spending and manage your finances in one place.
                  </p>
                  <Button onClick={handleAddCard}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Your First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <div key={card.id} className="relative group">
                    <div 
                      className={`rounded-xl p-4 flex flex-col justify-between h-48 bg-gradient-to-r ${getCardGradient(card.cardColor || 'blue')} text-white shadow-sm`}
                    >
                      <div className="flex justify-between">
                        <div className="text-lg font-semibold">{card.bankName}</div>
                        <div>
                          <i className={`fab fa-cc-${card.cardType.toLowerCase()} text-2xl`}></i>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm opacity-80 mb-1">Card Number</div>
                        <div className="font-medium">•••• •••• •••• {card.lastFour}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm opacity-80">Valid Thru</div>
                          <div className="font-medium">{card.expiryDate}</div>
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Type</div>
                          <div className="font-medium">{getCardType(card.cardType)}</div>
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Balance</div>
                          <div className="font-medium">{formatCurrency(card.balance)}</div>
                        </div>
                      </div>
                      
                      {card.isDefault && (
                        <div className="absolute top-3 right-3 bg-white/20 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Default
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Card</DropdownMenuItem>
                          <DropdownMenuItem>Set as Default</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Remove Card</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {/* Add Card Button Card */}
                <div 
                  onClick={handleAddCard}
                  className="rounded-xl border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center h-48 bg-gray-50 text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  <CreditCard className="h-10 w-10 mb-3" />
                  <div className="text-center">
                    <div className="font-medium mb-1">Add New Card</div>
                    <div className="text-sm text-gray-400">Link another card to your account</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Card Management Tips */}
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-lg font-semibold">Card Management Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Secure Your Cards</h3>
                    <p className="text-sm text-gray-600">
                      Regularly monitor your card activity and enable notifications for all transactions to detect unauthorized charges.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded mr-3">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Pay On Time</h3>
                    <p className="text-sm text-gray-600">
                      Set up automatic payments for at least the minimum amount due on your credit cards to avoid late fees.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {activeModal === "addCard" && <AddCardModal />}
    </div>
  );
}