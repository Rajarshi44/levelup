// services/aiService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
const LLAMA_MODEL = "llama-70b-chat";

export const getPersonalizedAdvice = async (userData, domain) => {
  try {
    const userHistory = await AsyncStorage.getItem("userProgressHistory");
    const parsedHistory = JSON.parse(userHistory || "{}");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: LLAMA_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a personal development AI coach specialized in fitness, programming, and discipline building.",
          },
          {
            role: "user",
            content: `Based on my progress data: ${JSON.stringify({
              ...userData,
              history: parsedHistory,
            })}, 
            provide specific advice for improving in ${domain}. Consider my current level, recent challenges, and goals.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Integration Error:", error);
    return "Unable to connect to AI coach. Try again later.";
  }
};

export const generateAdaptiveSchedule = async (
  userPreferences,
  completionRates
) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: LLAMA_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an AI scheduler optimizing for productivity and consistent habit building.",
          },
          {
            role: "user",
            content: `Create an optimal daily schedule based on: 
            User preferences: ${JSON.stringify(userPreferences)},
            Past completion rates: ${JSON.stringify(completionRates)}.
            Optimize for high consistency and gradual progression.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Scheduling Error:", error);
    return null;
  }
};
