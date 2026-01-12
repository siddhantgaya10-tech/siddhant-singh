import { GoogleGenAI } from "@google/genai";
import { ParaphraseMode, RewiteRequest, SummaryRequest } from "../types";

// Initialize Gemini client
// Using process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_PARAPHRASE = `
You are a professional writing assistant. Your task is to rewrite user input text based on specific modes and synonym usage levels.
Always return ONLY the rewritten text. Do not include introductory phrases like "Here is the rewritten text:".
`;

const SYSTEM_INSTRUCTION_SUMMARY = `
You are an expert summarizer. Create concise and accurate summaries of the provided text.
Always return ONLY the summary. Do not include introductory phrases.
`;

export const streamParaphrase = async (
  request: RewiteRequest,
  onChunk: (text: string) => void
): Promise<void> => {
  const { text, mode, synonymsLevel } = request;
  
  // Construct the prompt based on mode and synonyms
  let toneInstruction = "";
  switch (mode) {
    case ParaphraseMode.STANDARD:
      toneInstruction = "Rewrite the text to be reliable and easy to understand. Maintain the original meaning.";
      break;
    case ParaphraseMode.FLUENCY:
      toneInstruction = "Fix grammar mistakes and make the text sound natural and fluent.";
      break;
    case ParaphraseMode.FORMAL:
      toneInstruction = "Rewrite the text to sound professional, sophisticated, and suitable for business or official contexts.";
      break;
    case ParaphraseMode.SIMPLE:
      toneInstruction = "Simplify the vocabulary and sentence structure to make it understandable for a general audience or children.";
      break;
    case ParaphraseMode.CREATIVE:
      toneInstruction = "Rewrite the text with more descriptive, varied, and expressive vocabulary. Feel free to alter the structure slightly for impact.";
      break;
    case ParaphraseMode.ACADEMIC:
      toneInstruction = "Rewrite the text in a scholarly style, using precise terminology and formal sentence structures suitable for research papers.";
      break;
  }

  let synonymInstruction = "";
  if (synonymsLevel < 33) {
    synonymInstruction = "Use common and simple words. Avoid complex synonyms.";
  } else if (synonymsLevel > 66) {
    synonymInstruction = "Aggressively replace words with synonyms to vary the vocabulary significantly.";
  } else {
    synonymInstruction = "Use a balanced amount of synonyms to keep the text fresh but natural.";
  }

  const prompt = `
    Input Text: "${text}"
    
    Instructions:
    1. Mode: ${toneInstruction}
    2. Synonyms: ${synonymInstruction}
    3. Output: Provide only the rewritten text.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PARAPHRASE,
        temperature: mode === ParaphraseMode.CREATIVE ? 0.9 : 0.7,
      }
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
            onChunk(chunk.text);
        }
    }
  } catch (error) {
    console.error("Paraphrase error:", error);
    throw error;
  }
};

export const streamSummary = async (
  request: SummaryRequest,
  onChunk: (text: string) => void
): Promise<void> => {
  const { text, length, format } = request;

  let lengthInstruction = "";
  if (length === 'short') lengthInstruction = "Keep it very concise, capturing only the absolute core message.";
  if (length === 'medium') lengthInstruction = "Provide a balanced summary covering main points and key details.";
  if (length === 'long') lengthInstruction = "Provide a detailed summary that includes most supporting points.";

  let formatInstruction = format === 'bullets' ? "Format the output as a list of bullet points." : "Format the output as a cohesive paragraph.";

  const prompt = `
    Input Text: "${text}"
    
    Instructions:
    1. Length: ${lengthInstruction}
    2. Format: ${formatInstruction}
    3. Output: Provide only the summary.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SUMMARY,
        temperature: 0.5,
      }
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
            onChunk(chunk.text);
        }
    }
  } catch (error) {
    console.error("Summary error:", error);
    throw error;
  }
};
