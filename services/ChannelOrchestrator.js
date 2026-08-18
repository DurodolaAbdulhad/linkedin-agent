import { Audience } from '../models/Audience.js';

export class ChannelOrchestrator {
  static getOptimalChannelForAudience(audienceId) {
    const audience = Audience.findById(audienceId);
    if (!audience) return ['LinkedIn', 'Email'];

    // Determine best channel based on audience preferences
    const preferredChannels = audience.preferredChannels || ['LinkedIn'];

    // Rank by preference
    const channelRanking = {
      LinkedIn: preferredChannels.includes('LinkedIn') ? 10 : 5,
      Twitter: preferredChannels.includes('Twitter') || preferredChannels.includes('X') ? 10 : 3,
      Email: preferredChannels.includes('Email') ? 10 : 7,
      WhatsApp: preferredChannels.includes('WhatsApp') ? 10 : 2,
      SMS: preferredChannels.includes('SMS') ? 10 : 1
    };

    // Return channels sorted by ranking
    return Object.entries(channelRanking)
      .sort(([, a], [, b]) => b - a)
      .map(([channel]) => channel);
  }

  static getOptimalChannelSequence(audienceId, funnelStage) {
    const audience = Audience.findById(audienceId);
    if (!audience) {
      return this.getDefaultSequence(funnelStage);
    }

    const preferredChannels = audience.preferredChannels || ['LinkedIn'];
    const baseSequence = this.getStageSequence(funnelStage);

    // Filter to only preferred channels, maintaining order
    const optimizedSequence = baseSequence.filter(channel =>
      preferredChannels.includes(channel) || channel === 'Email'
    );

    // Ensure at least 2 channels
    if (optimizedSequence.length < 2) {
      optimizedSequence.push(...baseSequence.filter(c => !optimizedSequence.includes(c)));
    }

    return optimizedSequence.slice(0, 3); // Max 3 channels per stage
  }

  static getStageSequence(funnelStage) {
    const sequences = {
      awareness: ['LinkedIn', 'Twitter', 'Email'], // Public awareness
      consideration: ['LinkedIn', 'Email', 'Twitter'], // Deeper engagement
      evaluation: ['Email', 'LinkedIn', 'SMS'], // Direct communication
      conversion: ['Email', 'SMS', 'LinkedIn'], // Final push
    };

    return sequences[funnelStage] || ['LinkedIn', 'Email', 'Twitter'];
  }

  static getDefaultSequence(funnelStage) {
    return this.getStageSequence(funnelStage);
  }

  static calculateMessageFrequency(funnelStage, daysInStage) {
    const frequencies = {
      awareness: { interval: 2, maxPerWeek: 3 }, // 2 days between messages, max 3/week
      consideration: { interval: 3, maxPerWeek: 2 }, // 3 days between messages, max 2/week
      evaluation: { interval: 5, maxPerWeek: 1 }, // 5 days between messages, max 1/week
      conversion: { interval: 1, maxPerWeek: 5 }, // 1 day between, max 5/week (high urgency)
    };

    const freq = frequencies[funnelStage] || frequencies.consideration;

    // Reduce frequency if in stage too long (prevent fatigue)
    if (daysInStage > 30) {
      return { interval: freq.interval * 2, maxPerWeek: Math.max(1, freq.maxPerWeek - 1) };
    }

    return freq;
  }

  static shouldSendMultiChannel(campaign, rule) {
    // Determine if we should send on multiple channels simultaneously

    // High-urgency rules (close, objection, high-fit) get multi-channel
    const urgentRules = ['high_icp_score', 'reply_objection', 'trial_started'];
    if (urgentRules.includes(rule.triggerEvent)) {
      return true;
    }

    // Early stage prospecting stays single-channel to avoid fatigue
    if (campaign.currentStage === 'awareness' && (campaign.messages?.length || 0) < 3) {
      return false;
    }

    // Multi-channel for evaluation stage
    if (campaign.currentStage === 'evaluation') {
      return true;
    }

    return false;
  }

  static getChannelMessageTemplate(channel, funnelStage, messageType) {
    const templates = {
      LinkedIn: {
        awareness: {
          introduction: 'Hi {name}, I thought you might find this valuable: {resource}',
          resource: 'Check out this guide: {resource_name}. It covers {pain_point}.',
          offer: 'We help {similar_companies} with {value_prop}. Would you be open to a quick chat?'
        },
        consideration: {
          introduction: 'Following up on my earlier message...',
          resource: 'This case study shows how similar companies solved {pain_point}.',
          offer: 'I have a solution that might help. 15 min call this week?'
        },
        evaluation: {
          introduction: 'Quick question about your current approach...',
          resource: 'Here is how {company_name} reduced {metric} by {result}.',
          offer: 'Shall we schedule a demo? I can show you exactly how this works.'
        },
        conversion: {
          introduction: 'One last thing...',
          resource: 'Final thought: this resource addresses your last concern.',
          offer: 'Ready to get started? I can set you up today.'
        }
      },
      Twitter: {
        awareness: {
          introduction: 'Hey {name}, saw your profile. Thought you might like this: {resource}',
          resource: '{resource_name} on {pain_point} — worth a read if you are in {industry}',
          offer: 'Building something cool? Would love to connect.'
        },
        consideration: {
          introduction: 'Circling back to my earlier thought...',
          resource: 'This {company_name} case study is gold for {pain_point} problems.',
          offer: 'Open to a quick call next week?'
        },
        evaluation: {
          introduction: 'Quick question...',
          resource: 'Real-world example of {metric} improvement using our approach.',
          offer: 'Demo tomorrow? 20 mins.'
        },
        conversion: {
          introduction: 'Last thing, promise...',
          resource: 'Addressing your concern: {resource_name}',
          offer: 'Let us get you started. Today?'
        }
      },
      Email: {
        awareness: {
          introduction: 'Hi {name},\n\nI came across your profile and think you might benefit from {resource}.',
          resource: 'Subject: {resource_name} might help with {pain_point}\n\nThis guide covers exactly what you mentioned.',
          offer: 'Subject: Thought of you\n\nWe work with {similar_companies}. Would a brief conversation help?'
        },
        consideration: {
          introduction: 'Subject: Following up on my earlier email\n\nDid the last message resonate?',
          resource: 'Subject: Case study: How {company} solved {pain_point}\n\nThis might help you think through your options.',
          offer: 'Subject: Quick question\n\nWould you be open to a 15-minute call this week?'
        },
        evaluation: {
          introduction: 'Subject: Addressing your concerns\n\nBased on what you mentioned...',
          resource: 'Subject: Evidence of impact\n\nHere is how other {industry} companies achieved {result}.',
          offer: 'Subject: Demo invitation\n\nI think you will see the value in 20 minutes. Available this week?'
        },
        conversion: {
          introduction: 'Subject: Final thoughts\n\nOne more thing...',
          resource: 'Subject: Quick confirmation\n\nJust to confirm, the main concern was {objection}. Here is how we handle it.',
          offer: 'Subject: Let us get you started\n\nReady? I can activate your account today.'
        }
      }
    };

    const channelTemplates = templates[channel] || templates.LinkedIn;
    const stageTemplates = channelTemplates[funnelStage] || channelTemplates.awareness;
    return stageTemplates[messageType] || stageTemplates.introduction;
  }

  static shouldCoordinateChannels(campaigns) {
    // Check if we should coordinate messaging across channels for same prospect
    // Returns true if prospect appears on multiple channels

    const profileIds = campaigns.map(c => c.profileId);
    const uniqueProfiles = new Set(profileIds);

    // If same profile on multiple channels, coordinate
    return profileIds.length > uniqueProfiles.size;
  }

  static getCoordinationStrategy(campaigns, profileId) {
    // Get all campaigns for this prospect across channels
    const prospectCampaigns = campaigns.filter(c => c.profileId === profileId);

    if (prospectCampaigns.length < 2) {
      return { coordinated: false, strategy: 'single_channel' };
    }

    // Determine best coordinated approach
    const channels = prospectCampaigns.map(c => c.platform);
    const stages = prospectCampaigns.map(c => c.currentStage);

    // All channels should be at same stage
    const sameStage = stages.every(s => s === stages[0]);

    if (!sameStage) {
      return {
        coordinated: true,
        strategy: 'stage_alignment',
        recommendation: `Align ${channels[0]} (${stages[0]}) with ${channels[1]} (${stages[1]})`
      };
    }

    // If at same stage, use complementary messaging
    return {
      coordinated: true,
      strategy: 'complementary_messaging',
      channels,
      stage: stages[0],
      recommendation: `Use ${channels[0]} for detailed info, ${channels[1]} for quick engagement`
    };
  }
}
