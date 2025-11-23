import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '@/types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        question: {
            type: Type.STRING,
            description: "The question text."
        },
        options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers.",
            items: { type: Type.STRING }
        },
        correctAnswer: {
            type: Type.STRING,
            description: "The correct answer, which must be one of the strings from the options array."
        },
    }
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: questionSchema
        }
    }
};

export const geminiService = {
    generateQuizQuestions: async (topic: string, count: number): Promise<Omit<Question, 'id'>[]> => {
        if (!process.env.API_KEY) {
          throw new Error("Gemini API key is not configured.");
        }
        try {
            const prompt = `Generate ${count} unique, high-quality multiple-choice questions about "${topic}". Each question must have exactly 4 options, and one of them must be the correct answer.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: quizSchema,
                },
            });

            const jsonText = response.text;
            const parsed = JSON.parse(jsonText);
            
            if (parsed.questions && Array.isArray(parsed.questions)) {
                // Defensively handle the response to ensure data integrity
                return parsed.questions.filter(Boolean).map((q: any) => ({
                    question: q.question || 'Untitled Question',
                    options: Array.isArray(q.options) ? q.options : [],
                    correctAnswer: q.correctAnswer || ''
                }));
            } else {
                throw new Error("Invalid format received from Gemini API.");
            }
        } catch (error) {
            console.error("Error generating quiz questions with Gemini:", error);
            throw new Error("Failed to generate questions. Please check the topic and try again.");
        }
    }
};