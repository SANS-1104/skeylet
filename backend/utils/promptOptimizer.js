// file: utils/promptOptimizer.js

// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function optimizePrompt(
//   userPrompt,
//   tone = 'Professional',
//   length = 'Medium'
// ) {
//   try {
//     // ✅ Validation
//     if (!userPrompt || userPrompt.trim().length === 0) {
//       return { success: false, optimized_prompt: userPrompt };
//     }

//     if (userPrompt.length > 5000) {
//       return { success: false, optimized_prompt: userPrompt };
//     }

//     const model = genAI.getGenerativeModel({
//       model: 'gemini-1.5-flash'
//     });

//     const systemPrompt = `You are an expert prompt engineer and AI interaction designer.

// GOAL:
// Rewrite the user's prompt to maximize clarity, effectiveness, and output quality.

// USER PREFERENCES:
// - Desired tone: ${tone}
// - Desired length: ${length}

// RULES:
// - Preserve intent
// - Do NOT add new requirements
// - Remove ambiguity
// - Add context only if needed
// - Make instructions clear
// - Apply tone + length
// - Define output format if missing
// - No explanations

// OUTPUT:
// Return ONLY optimized prompt.

// USER PROMPT:
// ${userPrompt}`;

//     const result = await model.generateContent(systemPrompt);
//     const optimizedPrompt = result.response.text().trim();

//     return {
//       success: true,
//       original_prompt: userPrompt,
//       optimized_prompt: optimizedPrompt
//     };

//   } catch (error) {
//     console.error('[PromptOptimizer Error]', error.message);

//     return {
//       success: false,
//       original_prompt: userPrompt,
//       optimized_prompt: userPrompt
//     };
//   }
// }

// file: utils/promptOptimizer.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function optimizePrompt(
  userPrompt,
  tone = 'Professional',
  length = 'Medium'
) {
  try {
    // ✅ Validation
    if (!userPrompt || userPrompt.trim().length === 0) {
      return { success: false, optimized_prompt: userPrompt };
    }

    if (userPrompt.length > 5000) {
      return { success: false, optimized_prompt: userPrompt };
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const systemPrompt = `You are an expert prompt engineer and AI interaction designer.

GOAL:
Rewrite the user's prompt to maximize clarity, effectiveness, and output quality.

USER PREFERENCES:
- Desired tone: ${tone}
- Desired length: ${length}

RULES:
- Preserve intent
- Do NOT add new requirements
- Remove ambiguity
- Add context only if needed
- Make instructions clear
- Apply tone + length
- Define output format if missing
- No explanations

OUTPUT:
Return ONLY optimized prompt.

USER PROMPT:
${userPrompt}`;

    const result = await model.generateContent(systemPrompt);

    // ✅ safer extraction
    const optimizedPrompt =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      userPrompt;

    return {
      success: true,
      original_prompt: userPrompt,
      optimized_prompt: optimizedPrompt
    };

  } catch (error) {
    console.error('[PromptOptimizer Error]', error.message);

    return {
      success: false,
      original_prompt: userPrompt,
      optimized_prompt: userPrompt
    };
  }
}