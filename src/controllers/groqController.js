import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Updated model

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);

// Helper function to generate a response from the Groq API
const generateGroqResponse = async (prompt) => {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();

    console.log('Groq API Status:', res.status);
    console.log('Groq API Response:', JSON.stringify(data, null, 2));

    if (!res.ok || !data.choices?.length) {
      throw new Error(data?.error?.message || 'Groq API error');
    }

    return data.choices[0].message.content; // ✨ Extract only the useful message
  } catch (err) {
    console.error('Groq API Full Error:', err);
    throw err;
  }
};

// Summarize the entire conversation
export const summarizeMessage = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required for summarization' });
    }

    const prompt = `Summarize this conversation:\n${messages.join('\n')}`;
    const summary = await generateGroqResponse(prompt);
    res.status(200).json({ summary }); // no change here
  } catch (error) {
    console.error('Error in summarizeMessage:', error);
    res.status(500).json({ message: 'Failed to summarize message' });
  }
};

// Translate a message to a target language
export const translateMessage = async (req, res) => {
  try {
    const { message, targetLang } = req.body;
    if (!message || !targetLang) {
      return res.status(400).json({ message: 'Message and targetLang are required' });
    }

    const prompt = `Translate this message to ${targetLang}: ${message}`;
    const translated = await generateGroqResponse(prompt); // ✨ Change variable to `translated`
    res.status(200).json({ translated }); // ✨ IMPORTANT: send { translated }
  } catch (error) {
    console.error('Error in translateMessage:', error.message);
    res.status(500).json({ message: 'Failed to translate message' });
  }
};

// Suggest a reply to a message
export const suggestReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required to suggest a reply' });
    }

    const prompt = `Suggest a helpful and friendly reply to this message: ${message}`;
    const suggestion = await generateGroqResponse(prompt);
    res.status(200).json({ suggestion });
  } catch (error) {
    console.error('Error in suggestReply:', error.message);
    res.status(500).json({ message: 'Failed to generate reply suggestion' });
  }
};
