import { promises as fs } from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const loadPrompt = async (filePath) => {
  return await fs.readFile(filePath, "utf8");
};

const loadConfig = async (filePath) => {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
};

const analyzeText = async (filePath) => {
  try {
    const text = await fs.readFile(filePath, "utf8");
    const systemPrompt = await loadPrompt("system-prompt.md");
    const userPrompt = await loadPrompt("user-prompt.md");
    const config = await loadConfig("openai-config.json");

    const response = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${userPrompt}\n\nText to analyze:\n${text}`,
        },
      ],
    });

    console.log("\nAnalysis Results:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide a file path as an argument");
  process.exit(1);
}

analyzeText(filePath);
