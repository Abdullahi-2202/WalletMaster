import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

// Get financial advice from OpenAI
export async function getFinancialAdvice(message: string, userData: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial assistant in the Wallet Master app. 
          Provide useful, personalized financial advice based on the user data provided. 
          Be concise, practical, and friendly. Focus on actionable advice that can help 
          the user improve their financial health. Context about the user: ${JSON.stringify(userData)}`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return response.choices[0].message.content || "I'm having trouble providing advice right now. Please try again later.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

// Generate financial insights based on user data
export async function generateFinancialInsights(userData: any): Promise<{ insights: Array<{ text: string, type: string, icon: string, color: string }> }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a financial analysis AI for the Wallet Master app. 
          Based on the user's transaction history, budget allocation, savings goals, and overall financial behavior, 
          generate 2-3 actionable insights that can help them improve their financial health. 
          Each insight should include a type (spending, saving, or investment), 
          an appropriate icon name (from Font Awesome, like 'lightbulb', 'piggy-bank', etc.), 
          and a color (like '#3B82F6' for blue, '#10B981' for green, or '#EF4444' for red). 
          Format your response as JSON.`
        },
        {
          role: "user",
          content: JSON.stringify(userData)
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content || "{}");
    return parsedResponse.insights ? 
      { insights: parsedResponse.insights } : 
      { insights: [
        { 
          text: "Based on your spending patterns, try to reduce dining out expenses to save more.", 
          type: "spending", 
          icon: "utensils", 
          color: "#3B82F6" 
        },
        { 
          text: "Consider setting up an emergency fund worth 3-6 months of expenses.", 
          type: "saving", 
          icon: "piggy-bank", 
          color: "#10B981" 
        }
      ] };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return {
      insights: [
        { 
          text: "Try to save at least 20% of your monthly income for long-term goals.", 
          type: "saving", 
          icon: "piggy-bank", 
          color: "#10B981" 
        },
        { 
          text: "Review your subscription services and cancel ones you don't use regularly.", 
          type: "spending", 
          icon: "lightbulb", 
          color: "#3B82F6" 
        }
      ]
    };
  }
}

// Analyze spending patterns for recommendations
export async function analyzeSpendingPatterns(transactionData: any): Promise<{ recommendations: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a financial analysis AI that specializes in identifying spending patterns and providing 
          actionable recommendations. Analyze the provided transaction data and generate 3 specific recommendations 
          to help the user optimize their spending. Focus on identifying unusual spending patterns, potential savings 
          opportunities, and budget optimizations. Format your response as a JSON object with a 'recommendations' array.`
        },
        {
          role: "user",
          content: JSON.stringify(transactionData)
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content || "{}");
    return parsedResponse.recommendations ? 
      { recommendations: parsedResponse.recommendations } : 
      { recommendations: [
        "Consider meal prepping to reduce food delivery expenses.",
        "Your entertainment spending is higher than average. Try free alternatives.",
        "Consolidate subscriptions to save on monthly costs."
      ] };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return {
      recommendations: [
        "Analyze your recurring subscriptions and cancel unused ones.",
        "Try a 30-day spending challenge in a high-expense category.",
        "Consider using cashback or rewards credit cards for regular expenses."
      ]
    };
  }
}
