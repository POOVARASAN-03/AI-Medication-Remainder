const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getChatbotResponse = async (prompt) => {
  try {
    const chat = model.startChat({
      history: [], // You can maintain conversation history here
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    throw new Error('Failed to get response from Gemini chatbot.');
  }
};

module.exports = { getChatbotResponse };
