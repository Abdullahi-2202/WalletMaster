import { useContext } from "react";
import { AiInsight } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Bot } from "lucide-react";
import { ModalContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface AIInsightsProps {
  insights: AiInsight[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AIInsights({
  insights,
  isLoading,
  onRefresh,
  isRefreshing,
}: AIInsightsProps) {
  const { setActiveModal } = useContext(ModalContext);

  const handleChatbotOpen = () => {
    setActiveModal("chatbot");
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="px-5 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
            <button className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 bg-gray-100 rounded-lg">
                <div className="flex items-start">
                  <Skeleton className="w-8 h-8 rounded-full mr-3 flex-shrink-0" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
          <button 
            className={`p-1 text-gray-500 hover:text-gray-700 focus:outline-none ${
              isRefreshing ? "animate-spin" : ""
            }`}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {insights.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No AI insights available</p>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium"
                onClick={onRefresh}
              >
                Generate Insights
              </button>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg`}
                style={{ backgroundColor: `${insight.color}10` }}
              >
                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0`}
                    style={{ backgroundColor: insight.color }}
                  >
                    <i className={`fas fa-${insight.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{insight.insight}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="w-full mt-4 flex justify-center items-center p-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary hover:text-white transition-colors"
          onClick={handleChatbotOpen}
        >
          <Bot className="mr-2 h-4 w-4" /> Get Financial Advice
        </button>
      </CardContent>
    </Card>
  );
}

AIInsights.defaultProps = {
  insights: [],
  isLoading: false,
  onRefresh: () => {},
  isRefreshing: false,
};
