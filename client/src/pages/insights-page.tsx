import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, MessageSquare, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import { AiInsightType, AiMessageType, TransactionType } from "@/types";
import { ModalContext } from "@/App";
import { ChatbotModal } from "@/components/chatbot/chatbot-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

export default function InsightsPage() {
  const { user } = useAuth();
  const { activeModal, setActiveModal } = useContext(ModalContext);
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  
  // Fetch AI insights
  const { data: aiInsights = [], isLoading: isLoadingInsights, refetch: refetchInsights } = useQuery<AiInsightType[]>({
    queryKey: ["/api/ai/insights"],
  });
  
  // Fetch chat history with limited messages
  const { data: chatHistory = [], isLoading: isLoadingChat } = useQuery<AiMessageType[]>({
    queryKey: ["/api/ai/chat/history", { limit: 5 }],
    enabled: false, // Disable this for now until endpoint is implemented
  });
  
  // Fetch transaction data for spending patterns
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<TransactionType[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Handle opening the chatbot modal
  const handleChatbotOpen = () => {
    setActiveModal("chatbot");
  };
  
  // Handle refreshing insights
  const handleRefreshInsights = async () => {
    if (refreshingInsights) return;
    
    setRefreshingInsights(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/ai/insights"] });
      await refetchInsights();
    } finally {
      setRefreshingInsights(false);
    }
  };
  
  // Get insights by type
  const getInsightsByType = (type: string) => {
    return aiInsights.filter(insight => insight.type === type);
  };
  
  const spendingInsights = getInsightsByType('spending');
  const savingInsights = getInsightsByType('saving');
  const investmentInsights = getInsightsByType('investment');
  
  // If user not logged in, don't render anything
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 md:ml-64 mb-16 md:mb-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">AI Insights</h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className={`gap-2 ${refreshingInsights ? "opacity-70" : ""}`}
                onClick={handleRefreshInsights}
                disabled={refreshingInsights}
              >
                <RefreshCw className={`h-4 w-4 ${refreshingInsights ? "animate-spin" : ""}`} /> 
                Refresh Insights
              </Button>
              <Button className="gap-2" onClick={handleChatbotOpen}>
                <MessageSquare className="h-4 w-4" /> 
                Financial Assistant
              </Button>
            </div>
          </div>
          
          {/* AI Insights Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mr-2">
                    <TrendingUp className="h-3 w-3" />
                  </div>
                  Spending Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInsights ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : spendingInsights.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No spending insights available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {spendingInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${insight.color}10` }}
                      >
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                            style={{ backgroundColor: insight.color }}
                          >
                            <i className={`fas fa-${insight.icon}`}></i>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">{insight.insight}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-2">
                    <i className="fas fa-piggy-bank text-xs"></i>
                  </div>
                  Saving Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInsights ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : savingInsights.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No saving insights available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savingInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${insight.color}10` }}
                      >
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                            style={{ backgroundColor: insight.color }}
                          >
                            <i className={`fas fa-${insight.icon}`}></i>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">{insight.insight}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center mr-2">
                    <i className="fas fa-chart-line text-xs"></i>
                  </div>
                  Investment Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInsights ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : investmentInsights.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No investment insights available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {investmentInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${insight.color}10` }}
                      >
                        <div className="flex items-start">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                            style={{ backgroundColor: insight.color }}
                          >
                            <i className={`fas fa-${insight.icon}`}></i>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">{insight.insight}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Spending Patterns Analysis */}
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Spending Alerts & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Add transactions to get spending recommendations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-amber-100 text-amber-600 p-2 rounded mr-3 flex-shrink-0">
                        <i className="fas fa-utensils"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Dining Expenses Above Average</h3>
                        <p className="text-sm text-gray-600">
                          Your dining expenses this month are 24% higher than your 3-month average. Consider cooking at home more often.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded mr-3 flex-shrink-0">
                        <i className="fas fa-shopping-bag"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Recurring Subscription Found</h3>
                        <p className="text-sm text-gray-600">
                          We detected a new monthly subscription to "StreamPro" for $12.99. Make sure you're still using this service.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-green-100 text-green-600 p-2 rounded mr-3 flex-shrink-0">
                        <i className="fas fa-gas-pump"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Transportation Savings Opportunity</h3>
                        <p className="text-sm text-gray-600">
                          You could save about $75 monthly by using public transportation twice a week instead of driving.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Chat History */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Conversations</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" onClick={handleChatbotOpen}>
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingChat ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Bot className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Conversations Yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4">
                    Chat with our AI financial assistant to get personalized advice and answers to your financial questions.
                  </p>
                  <Button onClick={handleChatbotOpen}>
                    Start Conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white mr-2">
                            <i className="fas fa-user text-xs"></i>
                          </div>
                          <div className="font-medium text-gray-800">You</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(chat.timestamp)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{chat.message}</p>
                      <div className="flex items-start mt-3">
                        <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white mr-2">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg flex-1">
                          <p className="text-sm text-gray-800">{chat.response}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {activeModal === "chatbot" && <ChatbotModal />}
    </div>
  );
}