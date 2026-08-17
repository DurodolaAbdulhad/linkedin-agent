import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'mistral';

export const generateDM = async (profileData) => {
  const prompt = `You are an expert LinkedIn outreach specialist. Generate a personalized, short LinkedIn DM (max 150 words) for this person:

Name: ${profileData.name}
Title: ${profileData.title}
Company: ${profileData.company}
Pain Point: ${profileData.painPoint}

Requirements:
- Street vibe, conversational tone
- No corporate language
- Mention 1 specific insight about their pain point
- Ask an open-ended question
- NO self-promotion or asks
- Keep it SHORT (3-4 short sentences)

Generate ONLY the DM text, nothing else.`;

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: prompt,
      stream: false,
    });
    return response.data.response.trim();
  } catch (error) {
    console.error('LLM Error:', error.message);
    throw new Error('Failed to generate DM');
  }
};

export const identifyPainPoint = async (profileText) => {
  const prompt = `Analyze this LinkedIn profile and identify the PRIMARY pain point:

${profileText}

Pain point categories: GTM strategy, fundraising, financial clarity, compliance, team building, product-market fit

Respond with ONLY the pain point category, nothing else.`;

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: prompt,
      stream: false,
    });
    return response.data.response.trim();
  } catch (error) {
    console.error('LLM Error:', error.message);
    return 'unknown';
  }
};
