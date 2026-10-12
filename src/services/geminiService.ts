import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const FREE_TIER_MODEL = "gemini-3.1-flash-lite-preview";

/**
 * Reusable delay function to avoid rate limits
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper for Gemini API calls with retry logic for 429 (Quota Exceeded)
 */
const callGemini = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error?.message?.toLowerCase() || "";
    
    // Handle Quota/Rate Limit
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
      if (retries > 0) {
        const waitTime = (4 - retries) * 12000; // 12s, 24s, 36s
        console.warn(`Rate limit hit. Retrying in ${waitTime/1000} seconds... (${retries} retries left)`);
        await delay(waitTime);
        return callGemini(fn, retries - 1);
      }
      throw new Error("Gemini API Quota Exceeded. The free tier has limits. Please wait a minute and try again.");
    }
    
    // Handle Server Errors
    if (errorMessage.includes("500") || errorMessage.includes("internal error") || errorMessage.includes("service unavailable")) {
      if (retries > 0) {
        console.warn(`Gemini Server Error. Retrying in 5 seconds... (${retries} retries left)`);
        await delay(5000);
        return callGemini(fn, retries - 1);
      }
    }

    // Handle Tool/Config Errors (e.g., 400 Bad Request if tools aren't supported)
    if (errorMessage.includes("400") || errorMessage.includes("invalid argument") || errorMessage.includes("not found")) {
       console.warn("Gemini API 400 Error - likely tool or config issue. Retrying without tools if applicable...");
       // The specific function will handle the retry without tools if it can
    }

    console.error("Gemini API Error Detail:", error);
    throw new Error(`Gemini API Error: ${error?.message || "Unknown error occurred"}`);
  }
};

/**
 * Safely extracts and parses JSON from a string that might contain markdown or extra text.
 */
const extractAndParseJSON = (text: string, _skillLevel?: string) => {
  try {
    if (!text) throw new Error("Empty response from AI");
    
    // Remove potential markdown code blocks
    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Try to find the first '{' or '[' and the last '}' or ']'
    const firstBrace = cleanedText.indexOf('{');
    const firstBracket = cleanedText.indexOf('[');
    const lastBrace = cleanedText.lastIndexOf('}');
    const lastBracket = cleanedText.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || (firstBrace < firstBracket && firstBrace !== -1))) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start === -1 || end === -1 || end < start) {
      // Fallback to regex if manual indexing fails
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON structure found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    const jsonStr = cleanedText.substring(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (error: any) {
    console.error("Failed to parse Gemini JSON response:", error.message);
    console.error("Raw Response Sample:", text.substring(0, 500) + "...");
    throw new Error("Invalid AI response format. Please try again.");
  }
};

export const generateCourseStructure = async (topic: string, skillLevel: string) => {
  const prompt = `You are an expert curriculum designer. Create a comprehensive 5-lesson course on "${topic}" (${skillLevel} level).
      
      For EACH lesson, you MUST provide:
      1. Lesson structure (title, description, concepts).
      2. YouTube query: A precise search query to find the best YouTube video tutorial for this specific lesson (e.g., "${topic} <Lesson Specific Concept> tutorial").
      3. A 5-question multiple choice quiz (question, 4 options, correctIndex, explanation).
      4. A practical programming task for a "${skillLevel}" learner.
         STRICT RULES:
         If Beginner:
         - NO installation or setup commands (no npm, npx, create-app)
         - NO framework setup
         - Only simple UI or basic logic
         - Must be doable in 5–10 minutes
         If Intermediate:
         - Allow basic setup
         - Include multiple steps
         - Include simple logic or state
         If Advanced:
         - Include real-world complexity
         - May include API usage or architecture
         CRITICAL:
         - The task difficulty MUST match "${skillLevel}"
         - DO NOT generate content above or below level
      5. A mini-project for a "${skillLevel}" learner.
         STRICT RULES:
         If Beginner:
         - Only static UI
         - Single page
         - No API, backend, or authentication
         - Use simple components (text, button, image)
         - Must be doable in 15–20 minutes
         If Intermediate:
         - Multiple components
         - Basic state (useState)
         - Some interactivity
         If Advanced:
         - MUST include at least ONE:
           - API integration
           - Authentication
           - Database
           - Complex state management
         CRITICAL:
         - DO NOT mismatch difficulty
         - The "difficulty" field MUST be "${skillLevel}"
      6. 5 technical interview questions with idealAnswers.
      
      Return a JSON array of exactly 5 lesson objects. Each object should have:
      - "title": string
      - "description": string
      - "difficulty": "${skillLevel}"
      - "youtubeSearchQuery": string
      - "videoTitle": string
      - "concepts": string (comma separated)
      - "quiz": array of 5 { "question": string, "options": string[], "correctIndex": number, "explanation": string }
      - "task": { "title": string, "description": string, "implementation": string, "conceptsUsed": string[], "difficulty": "${skillLevel}" }
      - "project": { "title": string, "difficulty": "${skillLevel}", "problemStatement": string, "whatToBuild": string, "uiComponents": string[], "concepts": string[], "expectedOutput": string }
      - "interviewQuestions": array of 5 { "question": string, "idealAnswer": string }`;

  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              youtubeSearchQuery: { type: Type.STRING },
              videoTitle: { type: Type.STRING },
              concepts: { type: Type.STRING },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctIndex", "explanation"]
                }
              },
              task: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  implementation: { type: Type.STRING },
                  conceptsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                  difficulty: { type: Type.STRING }
                },
                required: ["title", "description", "implementation", "conceptsUsed", "difficulty"]
              },
              project: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  problemStatement: { type: Type.STRING },
                  whatToBuild: { type: Type.STRING },
                  uiComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
                  concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expectedOutput: { type: Type.STRING }
                },
                required: ["title", "difficulty", "problemStatement", "whatToBuild", "uiComponents", "concepts", "expectedOutput"]
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    idealAnswer: { type: Type.STRING }
                  },
                  required: ["question", "idealAnswer"]
                }
              }
            },
            required: ["title", "description", "difficulty", "concepts", "quiz", "task", "project", "interviewQuestions"]
          }
        }
      }
    });
    return extractAndParseJSON(response.text || '', skillLevel);
  });
};

export const evaluateAnswer = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, userAnswer: string, type: 'task' | 'project') => {
  return callGemini(async () => {
    const prompt = type === 'task' 
      ? `Evaluate the user's solution for a coding task.
      
      Lesson: "${lessonTitle}"
      Topic: "${topic}"
      Concepts: "${concepts}"

      User Answer:
      "${userAnswer}"

      STRICT RULES:

      1. Focus on:
         - Code correctness and logic
         - Understanding of the core concept
         - Functional output

      2. DO NOT penalize for:
         - Missing npm/npx commands or setup steps
         - Minor syntax errors that don't break the logic
         - Different naming conventions or coding styles
         - Using alternative but valid technical approaches

      3. Scoring:
         - 9–10 → Fully correct and demonstrates solid understanding
         - 7–8 → Mostly correct with minor issues
         - 5–6 → Partial understanding, core logic is present but flawed
         - 0–4 → Incorrect or irrelevant

      4. Be LIBERAL: If the user's code shows they understand the concept, give them a high score even if it's not "perfect" production code.

      Return JSON:
      {
        "score": number,
        "feedback": "Encouraging feedback explaining correctness and areas for growth"
      }`
      : `Evaluate the user's mini-project submission.

      Lesson: "${lessonTitle}"
      Topic: "${topic}"
      Concepts: "${concepts}"

      User Answer:
      "${userAnswer}"

      STRICT RULES:

      1. Focus ONLY on:
         - UI components and structure
         - Basic layout and styling
         - Core functionality implementation

      2. DO NOT evaluate:
         - Environment setup or installation steps
         - Production-readiness or advanced optimizations
         - Minor CSS imperfections

      3. Scoring:
         - 9–10 → Complete and correct implementation
         - 7–8 → Mostly correct with minor UI/logic issues
         - 5–6 → Partial implementation
         - 0–4 → Incorrect or missing core features

      4. Be LIBERAL: Focus on the user's effort and understanding of the UI/UX concepts. If they built what was asked, even simply, give a high score.

      Return JSON:
      {
        "score": number,
        "feedback": "Positive feedback highlighting achievements and suggesting minor improvements"
      }`;

    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });
    return extractAndParseJSON(response.text || '');
  });
};

export const evaluateTask = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, code: string) => {
  return evaluateAnswer(lessonTitle, topic, videoTitle, concepts, code, 'task');
};

export const evaluateProject = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, code: string) => {
  return evaluateAnswer(lessonTitle, topic, videoTitle, concepts, code, 'project');
};

export const evaluateInterview = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, userAnswer: string, question: string, idealAnswer: string) => {
  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: `You are an intelligent interview answer evaluator. Your task is to evaluate whether a candidate's answer correctly addresses the given question.

Evaluation Rules:
1. Understand Intent: Focus on whether the answer addresses the core concept of the question. Do NOT rely only on exact keywords.
2. Accept Paraphrasing: Mark answers correct if they convey the same meaning using different wording. Synonyms and simplified explanations are valid.
3. Concept-Based Evaluation: Check if the key idea, reasoning, or explanation is present. Even if the answer is short, mark it correct if the concept is accurate.
4. Avoid Misclassification: Do NOT confuse the answer with unrelated domains (e.g., algorithms vs CSS, backend vs frontend). Stay strictly within the context of the question.
5. Partial Understanding: If the answer is somewhat correct but missing depth → mark as "Partially Correct".
6. Flexibility: Do NOT expect perfect grammar or structured sentences. Prioritize understanding over wording.
7. Strictness Control: Be moderately strict: accept correct ideas, reject clearly wrong or unrelated answers.

Context:
Lesson: "${lessonTitle}"
Topic: "${topic}"
Question: "${question}"
Ideal Answer: "${idealAnswer}"

User Answer:
"${userAnswer}"

Examples for your reference:
- Question: Why is mobile-first design used? | Answer: It starts with small screens and adds styles for bigger screens, making code cleaner. -> Verdict: Correct
- Question: What is OOP? | Answer: It is used to divide problems into smaller parts. -> Verdict: Incorrect
- Question: What is a loop? | Answer: It repeats a block of code multiple times. -> Verdict: Correct

Return ONLY a JSON object in this format:
{
  "score": number (3 for Correct, 2 for Partially Correct, 1 for Incorrect, 0 for Irrelevant),
  "result": "Correct / Partially Correct / Incorrect / Irrelevant",
  "matched_concepts": string[],
  "missing_concepts": string[],
  "feedback": "One concise line explaining why (The Reason)"
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            result: { type: Type.STRING },
            matched_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing_concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: { type: Type.STRING }
          },
          required: ["score", "result", "matched_concepts", "missing_concepts", "feedback"]
        }
      }
    });
    return extractAndParseJSON(response.text || '');
  });
};

// Fallback functions for older courses or if pre-generation failed.
// These use callGemini and delay to respect free tier limits.
export const generateQuiz = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string) => {
  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: `Generate a 5-question multiple choice quiz for the lesson "${lessonTitle}" on the topic "${topic}".
      Video Title: "${videoTitle}"
      Concepts: "${concepts}"
      
      Return a JSON array of 5 objects: { "question": string, "options": string[], "correctIndex": number, "explanation": string }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "explanation"]
          }
        }
      }
    });
    return extractAndParseJSON(response.text || '');
  });
};

export const generateTask = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, skillLevel: string = 'Intermediate') => {
  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: `Generate a practical programming task.
      Skill Level: "${skillLevel}"

      STRICT RULES:
      If Beginner:
      - NO installation or setup commands (no npm, npx, create-app)
      - NO framework setup
      - Only simple UI or basic logic
      - Must be doable in 5–10 minutes
      If Intermediate:
      - Allow basic setup
      - Include multiple steps
      - Include simple logic or state
      If Advanced:
      - Include real-world complexity
      - May include API usage or architecture

      CRITICAL:
      - The task difficulty MUST match "${skillLevel}"
      - DO NOT generate content above or below level

      Lesson: "${lessonTitle}"
      Topic: "${topic}"
      Concepts: "${concepts}"
      
      Return a JSON object: { "title": string, "description": string, "implementation": string, "conceptsUsed": string[], "difficulty": "${skillLevel}" }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            implementation: { type: Type.STRING },
            conceptsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING }
          },
          required: ["title", "description", "implementation", "conceptsUsed", "difficulty"]
        }
      }
    });
    return extractAndParseJSON(response.text || '', skillLevel);
  });
};

export const generateProject = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string, skillLevel: string = 'Intermediate') => {
  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: `Generate a mini-project.
      Skill Level: "${skillLevel}"

      STRICT RULES:
      If Beginner:
      - Only static UI
      - Single page
      - No API, backend, or authentication
      - Use simple components (text, button, image)
      - Must be doable in 15–20 minutes
      If Intermediate:
      - Multiple components
      - Basic state (useState)
      - Some interactivity
      If Advanced:
      - MUST include at least ONE:
        - API integration
        - Authentication
        - Database
        - Complex state management

      CRITICAL:
      - DO NOT mismatch difficulty
      - The "difficulty" field MUST be "${skillLevel}"

      Lesson: "${lessonTitle}"
      Topic: "${topic}"
      Concepts: "${concepts}"
      
      Return a JSON object: { "title": string, "difficulty": "${skillLevel}", "problemStatement": string, "whatToBuild": string, "uiComponents": string[], "concepts": string[], "expectedOutput": string }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            whatToBuild: { type: Type.STRING },
            uiComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
            concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutput: { type: Type.STRING }
          },
          required: ["title", "difficulty", "problemStatement", "whatToBuild", "uiComponents", "concepts", "expectedOutput"]
        }
      }
    });
    return extractAndParseJSON(response.text || '', skillLevel);
  });
};

export const generateInterviewQuestions = async (lessonTitle: string, topic: string, videoTitle: string, concepts: string) => {
  return callGemini(async () => {
    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: `Generate 5 technical interview questions with ideal answers for the lesson "${lessonTitle}" on the topic "${topic}".
      Video Title: "${videoTitle}"
      Concepts: "${concepts}"
      
      Return a JSON array of 5 objects: { "question": string, "idealAnswer": string }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              idealAnswer: { type: Type.STRING }
            },
            required: ["question", "idealAnswer"]
          }
        }
      }
    });
    return extractAndParseJSON(response.text || '');
  });
};
