const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function groqChat(prompt, maxTokens = 300) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

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
    return await groqChat(prompt, 250);
  } catch (error) {
    console.error('[llm] generateDM failed:', error.message);
    throw new Error('Failed to generate DM');
  }
};

export const identifyPainPoint = async (profileText) => {
  const prompt = `Analyze this LinkedIn profile and identify the PRIMARY pain point:

${profileText}

Pain point categories: GTM strategy, fundraising, financial clarity, compliance, team building, product-market fit

Respond with ONLY the pain point category, nothing else.`;

  try {
    return await groqChat(prompt, 20);
  } catch (error) {
    console.error('[llm] identifyPainPoint failed:', error.message);
    return 'unknown';
  }
};
