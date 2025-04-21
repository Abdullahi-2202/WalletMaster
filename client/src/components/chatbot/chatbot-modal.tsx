import { useState, useEffect, useRef, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, Sparkles, Info, Loader2 } from "lucide-react";
import { ModalContext } from "@/App";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { check_secrets } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AiMessageType } from "@/types";

// Types for chat messages
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatbotModal() {
  const { setActiveModal } = useContext(ModalContext);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if the OpenAI API key is available
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const hasKey = await check_secrets(["OPENAI_API_KEY"]);
        setIsApiKeyAvailable(hasKey);
        
        if (!hasKey) {
          toast({
            title: "API Key Missing",
            description: "OpenAI API key is required for AI features. Please set it in settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking API key:", error);
        setIsApiKeyAvailable(false);
      }
    };
    
    checkApiKey();
  }, [toast]);

  // Load welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "Hi there! I'm your AI financial assistant. I can answer questions about budgeting, saving, investing, and managing your finances. How can I help you today?",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Create mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { message });
      return await res.json();
    },
    onSuccess: (data: AiMessageType) => {
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/chat/history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI assistant.",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!input.trim() || !isApiKeyAvailable) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold">Financial Assistant</h2>
              <p className="text-xs text-gray-500">Powered by OpenAI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-primary-50" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {!isApiKeyAvailable ? (
          <div className="p-4 border-t">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">API Key Required</h3>
                  <p className="text-sm text-amber-700">
                    To use the AI assistant, you need to set up an OpenAI API key in your settings.
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-amber-700 font-medium"
                    onClick={() => {
                      setActiveModal(null);
                      // Navigate to settings
                    }}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-center mt-3">
                <div className="text-xs text-gray-500 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-primary" />
                  Try asking about budgeting tips, debt repayment, or investment advice
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}