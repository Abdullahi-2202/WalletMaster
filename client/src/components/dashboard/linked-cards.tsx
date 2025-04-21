import { useContext } from "react";
import { Card } from "@/types";
import { formatCurrency, getCardType } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { ModalContext } from "@/App";
import { Skeleton } from "@/components/ui/skeleton";

interface LinkedCardsProps {
  cards: Card[];
  isLoading: boolean;
}

export function LinkedCards({ cards, isLoading }: LinkedCardsProps) {
  const { setActiveModal } = useContext(ModalContext);

  const handleAddCard = () => {
    setActiveModal("addCard");
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Cards</h2>
          <button className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none">
            <PlusCircle className="h-4 w-4 inline mr-1" /> Add Card
          </button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-4">
            {[1, 2].map((i) => (
              <div key={i} className="min-w-[300px] h-44 rounded-xl p-4 bg-gray-100">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Cards</h2>
        <button
          className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none"
          onClick={handleAddCard}
        >
          <PlusCircle className="h-4 w-4 inline mr-1" /> Add Card
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`min-w-[300px] h-44 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-r ${
                card.cardColor === "green"
                  ? "from-secondary to-teal-400"
                  : "from-primary to-accent"
              } text-white shadow-sm`}
            >
              <div className="flex justify-between">
                <div className="text-lg font-semibold">{card.bankName}</div>
                <i className={`fab ${getCardType(card.cardType)} text-2xl`}></i>
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
                  <div className="text-sm opacity-80">CVV</div>
                  <div className="font-medium">•••</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Balance</div>
                  <div className="font-medium">{formatCurrency(card.balance)}</div>
                </div>
              </div>
            </div>
          ))}

          <div
            className="min-w-[300px] h-44 rounded-xl p-4 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors"
            onClick={handleAddCard}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <i className="fas fa-plus text-gray-500"></i>
            </div>
            <p className="text-sm font-medium">Add a new card</p>
          </div>
        </div>
      </div>
    </div>
  );
}

LinkedCards.defaultProps = {
  cards: [],
  isLoading: false,
};
