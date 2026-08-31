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

// Stage-specific prompts for the 7-stage sales sequence
const generateStagePrompt = (stage, profileData, previousReply = null) => {
  const baseContext = `
You are an expert sales professional. Generate a SHORT, personalized LinkedIn DM (max 150 words).
Target: ${profileData.name}, ${profileData.title} at ${profileData.company}
Pain Point: ${profileData.painPoint}
`;

  const stagePrompts = {
    1: `${baseContext}
STAGE 1: Prospect & Build Rapport
- Start a conversation naturally
- Show you understand their role/company
- Mention one specific insight about their industry/pain point
- NO sales pitch yet - just build connection
- Ask an open-ended question to learn more
Tone: Friendly, genuine, not salesy`,

    2: `${baseContext}
STAGE 2: Ask Questions & Identify Needs
${previousReply ? `They previously replied: "${previousReply}"` : ''}
- Reference their reply if they responded
- Ask 1-2 deep questions about their specific challenges
- Show you're listening and understanding
- Build on the rapport from Stage 1
Tone: Curious, consultative`,

    3: `${baseContext}
STAGE 3: Present Solution
${previousReply ? `Based on their replies: "${previousReply}"` : ''}
- Now introduce how your solution helps with THEIR specific pain point
- Focus on value, not features
- Make it relevant to what they shared
- Keep it brief - they can ask for details
Tone: Helpful, specific to their situation`,

    4: `${baseContext}
STAGE 4: Answer Objections
${previousReply ? `They raised concerns: "${previousReply}"` : ''}
- Address any hesitations they mentioned
- Provide social proof or results
- Explain why this matters for companies like theirs
- Remain confident but not pushy
Tone: Reassuring, credible`,

    5: `${baseContext}
STAGE 5: Close the Sale
${previousReply ? `Current sentiment: "${previousReply}"` : ''}
- They seem interested - now ask for next step
- Suggest a specific meeting time (e.g., "15 min coffee chat Thursday?")
- Make it easy to say yes
- Provide clear CTA
Tone: Direct, confident, action-oriented`,

    6: `${baseContext}
STAGE 6: Resale & Expansion
${previousReply ? `They engaged: "${previousReply}"` : ''}
- Suggest additional features or services they might benefit from
- Cross-sell or upsell naturally
- Show you're invested in their long-term success
- Offer extra value
Tone: Supportive, growth-focused`,

    7: `${baseContext}
STAGE 7: Get Referrals
${previousReply ? `They've been a customer/partner: "${previousReply}"` : ''}
- Ask for introductions to others who might benefit
- Make it easy (suggest specific types of people/companies)
- Offer to reciprocate
- Keep the relationship strong for future business
Tone: Grateful, collaborative`,
  };

  return stagePrompts[stage] || stagePrompts[1];
};

export const generateStagedDM = async (stage, profileData, previousReply = null) => {
  const prompt = generateStagePrompt(stage, profileData, previousReply);

  try {
    return await groqChat(prompt, 300);
  } catch (error) {
    console.error('[stageLLM] generateStagedDM failed:', error.message);
    throw new Error(`Failed to generate Stage ${stage} DM`);
  }
};

// Sentiment analysis (simplified - can be enhanced)
export const analyzeSentiment = (text) => {
  const positiveWords = ['interested', 'love', 'perfect', 'exactly', 'great', 'awesome', 'yes', 'definitely', 'agreed'];
  const negativeWords = ['no', 'not', 'cant', 'cannot', 'too expensive', 'not interested', 'busy'];
  const objectionWords = ['but', 'however', 'question', 'concern', 'worried', 'hesitant'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  const objectionCount = objectionWords.filter(w => lowerText.includes(w)).length;

  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else if (objectionCount > 0) {
    return 'objection';
  }
  return 'neutral';
};

// Calculate when to send next message based on reply
export const calculateNextMessageDelay = (sentiment, stage) => {
  const baseDelays = {
    1: 2, // 2 days after Stage 1
    2: 2,
    3: 2,
    4: 2,
    5: 1, // Faster follow-up for close
    6: 3,
    7: 7, // Long delay for referrals
  };

  const baseDays = baseDelays[stage] || 2;

  // Adjust based on sentiment
  if (sentiment === 'positive') return baseDays; // Send on schedule
  if (sentiment === 'objection') return baseDays - 1; // Faster - they're interested but have concerns
  if (sentiment === 'negative') return null; // Stop campaign
  return baseDays + 1; // Neutral - give them more time
};

export default {
  generateStagedDM,
  analyzeSentiment,
  calculateNextMessageDelay,
};
