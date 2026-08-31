const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function groqChat(prompt, maxTokens = 120) {
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
      temperature: 0.75,
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

// Twitter-specific prompts (shorter, more conversational, 280 char limit)
const generateTwitterStagePrompt = (stage, profileData, messageType = 'direct', previousReply = null) => {
  const baseContext = `You are a master at Twitter engagement. Generate a SHORT, punchy message (max 280 chars).
Target: @${profileData.name}, ${profileData.title}
Pain Point: ${profileData.painPoint}`;

  const directMessagePrompts = {
    1: `${baseContext}
STAGE 1 (Twitter DM): Break the ice
- Personal, casual tone (Twitter vibe)
- Reference something about them or their work
- Ask a question to start conversation
- Max 280 chars
Format: Just the DM text, no formatting`,

    2: `${baseContext}
${previousReply ? `They said: "${previousReply}"` : ''}
STAGE 2 (Twitter DM): Get curious
- Ask about their challenges with ${profileData.painPoint}
- Show genuine interest
- Keep it conversational
- Max 280 chars`,

    3: `${baseContext}
${previousReply ? `Based on their reply: "${previousReply}"` : ''}
STAGE 3 (Twitter DM): Show you can help
- Mention how your solution helps
- Use a specific example
- Value-first approach
- Max 280 chars`,

    4: `${baseContext}
STAGE 4 (Twitter DM): Address concerns
${previousReply ? `They worried about: "${previousReply}"` : ''}
- Be reassuring and confident
- Use brief social proof
- Max 280 chars`,

    5: `${baseContext}
STAGE 5 (Twitter DM): Move to coffee chat
- Ask for a 15min call
- Be direct and simple
- Max 280 chars`,

    6: `${baseContext}
STAGE 6 (Twitter DM): Upsell
- Suggest additional value/features
- Keep it light
- Max 280 chars`,

    7: `${baseContext}
STAGE 7 (Twitter DM): Ask for referrals
- Who else should we talk to?
- Keep it warm and friendly
- Max 280 chars`,
  };

  const publicReplyPrompts = {
    1: `${baseContext}
STAGE 1 (Twitter Reply): Jump in authentically
- Reply to their recent tweet
- Add genuine value or insight
- Don't mention your product yet
- Max 280 chars
- Start with "great point about..." or "exactly, because..."`,

    2: `${baseContext}
STAGE 2 (Twitter Reply): Build on their idea
- Extend their thought
- Show expertise on their pain point
- Ask a follow-up question
- Max 280 chars`,

    3: `${baseContext}
STAGE 3 (Twitter Reply): Pivot to your solution
- Now mention how your product helps
- Use a real example
- Keep it relevant to their tweet
- Max 280 chars`,

    4: `${baseContext}
STAGE 4 (Twitter Reply): Address objections
- If they seem hesitant, validate it
- Show others have had same concern
- Max 280 chars`,

    5: `${baseContext}
STAGE 5 (Twitter Reply): Soft CTA
- "Would love to chat more - DM me?"
- Light ask for conversation
- Max 280 chars`,

    6: `${baseContext}
STAGE 6 (Twitter Reply): Share more value
- Post thread or insight related to their interests
- Build authority
- Max 280 chars`,

    7: `${baseContext}
STAGE 7 (Twitter Reply): Nurture relationship
- Celebrate their wins
- Engage with their other tweets
- Build genuine connection
- Max 280 chars`,
  };

  const promptMap = messageType === 'direct' ? directMessagePrompts : publicReplyPrompts;
  return promptMap[stage] || promptMap[1];
};

export const generateTwitterMessage = async (stage, profileData, messageType = 'direct', previousReply = null) => {
  const prompt = generateTwitterStagePrompt(stage, profileData, messageType, previousReply);

  try {
    let message = await groqChat(prompt, 120);

    // Enforce Twitter char limit
    if (message.length > 280) {
      message = message.substring(0, 277) + '...';
    }

    return message;
  } catch (error) {
    console.error('[twitterLLM] generateTwitterMessage failed:', error.message);
    throw new Error(`Failed to generate Twitter Stage ${stage} message`);
  }
};

export const getTwitterEngagementStrategy = (stage, messageType) => {
  const strategies = {
    direct: {
      1: 'Introduction - establish rapport',
      2: 'Discovery - understand their challenges',
      3: 'Solution - show how you help',
      4: 'Objection - address concerns',
      5: 'Call-to-Action - request meeting',
      6: 'Expansion - upsell more value',
      7: 'Referral - ask for introductions',
    },
    public_reply: {
      1: 'Join conversation - add value without selling',
      2: 'Build authority - show expertise',
      3: 'Mention solution - introduce your product',
      4: 'Build trust - address concerns',
      5: 'Soft ask - suggest DM',
      6: 'Thought leadership - share insights',
      7: 'Relationship - long-term nurturing',
    },
  };

  return strategies[messageType]?.[stage] || 'Engage authentically';
};

export default {
  generateTwitterMessage,
  getTwitterEngagementStrategy,
};
