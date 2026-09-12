import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

let geminiClient = null;
let isGeminiConfigured = false;

if (apiKey && !apiKey.includes('your-gemini')) {
  try {
    geminiClient = new GoogleGenAI({ apiKey });
    isGeminiConfigured = true;
    console.log('[Gemini] Initialized client successfully');
  } catch (err) {
    console.warn('[Gemini] Initialization warning:', err.message);
  }
} else {
  console.warn('[Gemini] GEMINI_API_KEY is not configured. Running semantic similarity in local fallback mode.');
}

export { geminiClient, isGeminiConfigured };
