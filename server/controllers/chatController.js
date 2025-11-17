const { getChatbotResponse } = require('../services/geminiService');

// @desc    Get chatbot response
// @route   POST /api/chat/medical
// @access  Private (or Public, depending on requirements)
const getMedicalChatResponse = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Please provide a prompt' });
  }

  try {
    const response = await getChatbotResponse(prompt);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error in getMedicalChatResponse:', error);
    res.status(500).json({ message: 'Failed to get chatbot response' });
  }
};

module.exports = { getMedicalChatResponse };
