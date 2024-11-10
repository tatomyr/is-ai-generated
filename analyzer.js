import { promises as fs } from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeText(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");

    const systemPrompt = `
      You are an expert at detecting AI-generated content. 
      Analyze the text and provide percentage scores that indicate how likely each aspect is to be AI-generated. 
      Higher percentages mean more likely AI-generated. 
      Provide the response in Ukrainian.
    `;

    const userPrompt = `
      Analyze this text and provide percentage scores for how likely 
      each aspect is to be AI-generated:

      1. Pattern Consistency and Perplexity
         (higher % means more mechanical/AI-like patterns)
      2. Language Naturalness 
         (higher % means more artificial/AI-like language)
      3. Repetitiveness
         (higher % means AI-typical repetitive patterns)
      4. References and Citations (references have to be used it the text) 
         (higher % means lack of specific references/citations)
      5. Coherence: Examine the logical flow and connections between sentences and paragraphs.
      6. Overall AI Probability
         (final verdict on AI generation likelihood)
      
      For each metric, provide a percentage and brief explanation in Ukrainian. 
      Please use this format for each metric: 
      # <metric>: <percentage> 
        <explanation>
      Higher percentages should indicate stronger AI-generation signals.
      For References metric, mention any found citations or references in the explanation.
      
      Text to analyze:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    console.log("\nAnalysis Results:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide a file path as an argument");
  process.exit(1);
}

analyzeText(filePath);
