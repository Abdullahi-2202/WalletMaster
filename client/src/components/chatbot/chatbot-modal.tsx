import { useState, useRef, useEffect, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ModalContext } from "@/App";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { AiMessageType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User } from "lucide-react";
import { Loader2 } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatbotModal() {
  const { setActiveModal } = useContext(ModalContext);
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your financial assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch previous messages
  const { data: previousMessages, isLoading: loadingMessages } = useQuery<AiMessageType[]>({
    queryKey: ["/api/ai/chat/history"],
    enabled: false, // Disable auto-fetching for now as the endpoint isn't implemented yet
  });

  // Send message mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { message });
      return await res.json();
    },
    onSuccess: (data) => {
      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
  });

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send message to API
    chatMutation.mutate(message);

    // Clear input
    setMessage("");
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Close the modal
  const handleClose = () => {
    setActiveModal(null);
  };

  // Quick suggestions
  const suggestions = [
    "How can I reduce monthly expenses?",
    "Tips for saving money",
    "Investment advice for beginners",
    "How to build an emergency fund?",
  ];

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    
    // Focus the input
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 md:p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-[450px] md:h-[550px] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
        {/* Chatbot Header */}
        <div className="bg-primary px-4 py-3 flex justify-between items-center">
          <div className="flex items-center text-white">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Financial Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-gray-200 hover:bg-primary/80"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.role === "assistant" ? (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-end">
                    <div className="bg-primary p-3 rounded-lg shadow-sm max-w-[80%]">
                      <p className="text-sm text-white">{message.content}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {chatMutation.isPending && (
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%] flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <Input
              ref={inputRef}
              type="text"
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
            />
            <Button
              className="rounded-r-lg"
              onClick={handleSendMessage}
              disabled={!message.trim() || chatMutation.isPending}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-center mt-2 overflow-x-auto pb-1">
            <div className="flex space-x-2 flex-nowrap">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
