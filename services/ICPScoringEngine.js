/**
 * ICP Scoring Engine
 * Evaluates profiles against configurable ICP criteria
 * Returns: score (0-100), tier (auto-pass/maybe/fail), and reasoning
 */

// ICP Configuration - Stored in Appwrite, but seeded here
const DEFAULT_ICP_CONFIG = {
  "ascent_finance_smm": {
    name: "Ascent Finance - SME Founders",
    mustHave: [
      { field: "title", keywords: ["founder", "ceo", "owner"], weight: 25 },
      { field: "company_size", min: 1, max: 500, weight: 20 },
    ],
    strongSignals: [
      { field: "industry", keywords: ["fintech", "saas", "tech", "software"], weight: 20 },
      { field: "painPoint", keywords: ["cash flow", "finance", "accounting", "compliance"], weight: 15 },
      { field: "recentActivity", value: true, weight: 10 },
    ],
    niceToHave: [
      { field: "location", keywords: ["us", "uk", "canada", "africa"], weight: 5 },
      { field: "yearsInRole", max: 3, weight: 5 },
    ],
    disqualifiers: [
      { field: "title", keywords: ["student", "intern", "consultant"], weight: -100 },
      { field: "company_size", max: 0, weight: -100 },
    ],
    thresholds: {
      autoPass: 75,
      maybe: 50,
      fail: 0,
    },
  },

  "ascent_learn_professionals": {
    name: "Ascent Learn - Career-Seekers",
    mustHave: [
      { field: "jobSearching", value: true, weight: 30 },
      { field: "openToOpportunities", value: true, weight: 20 },
    ],
    strongSignals: [
      { field: "skillGaps", keywords: ["python", "javascript", "data", "product"], weight: 20 },
      { field: "yearsExperience", min: 0, max: 5, weight: 15 },
      { field: "recentActivity", value: true, weight: 15 },
    ],
    niceToHave: [
      { field: "location", keywords: ["us", "africa"], weight: 5 },
    ],
    disqualifiers: [
      { field: "title", keywords: ["ceo", "vp", "c-level"], weight: -50 },
    ],
    thresholds: {
      autoPass: 70,
      maybe: 45,
      fail: 0,
    },
  },

  "ascent_corporate_enterprise": {
    name: "Ascent Corporate - Enterprise",
    mustHave: [
      { field: "title", keywords: ["director", "vp", "head of", "cfo", "cto", "cmo"], weight: 30 },
      { field: "company_size", min: 500, max: 50000, weight: 25 },
    ],
    strongSignals: [
      { field: "industry", keywords: ["finance", "tech", "saas", "enterprise"], weight: 20 },
      { field: "recentActivity", value: true, weight: 15 },
      { field: "mutualConnections", min: 1, weight: 10 },
    ],
    niceToHave: [
      { field: "location", keywords: ["us", "uk", "europe"], weight: 5 },
    ],
    disqualifiers: [
      { field: "title", keywords: ["student", "intern", "freelancer"], weight: -100 },
      { field: "company_size", min: 50001, weight: -50 },
    ],
    thresholds: {
      autoPass: 80,
      maybe: 55,
      fail: 0,
    },
  },
};

/**
 * Score a profile against ICP criteria
 * @param {Object} profile - Profile data from database
 * @param {String} icpKey - Which ICP config to use
 * @param {Object} customConfig - Optional custom ICP config
 * @returns {Object} { score: 0-100, tier: 'auto-pass'|'maybe'|'fail', reasons: [], breakdown: {} }
 */
export function scoreProfileAgainstICP(profile, icpKey = 'ascent_finance_smm', customConfig = null) {
  const config = customConfig || DEFAULT_ICP_CONFIG[icpKey];

  if (!config) {
    return {
      score: 0,
      tier: 'fail',
      reasons: [`ICP config not found: ${icpKey}`],
      breakdown: {},
    };
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  const reasons = [];
  const breakdown = {};

  // Check must-haves first (any failure = automatic fail)
  let mustHavePass = true;
  for (const criterion of config.mustHave) {
    maxPossibleScore += criterion.weight;
    const result = evaluateCriterion(profile, criterion);

    if (result.passes) {
      totalScore += criterion.weight;
      reasons.push(`✓ Must-have: ${criterion.field} (${criterion.weight}pts)`);
      breakdown[`must_${criterion.field}`] = { passes: true, score: criterion.weight };
    } else {
      mustHavePass = false;
      reasons.push(`✗ Must-have FAILED: ${criterion.field} - ${result.reason}`);
      breakdown[`must_${criterion.field}`] = { passes: false, score: 0, reason: result.reason };
    }
  }

  // If any must-have failed, return fail immediately
  if (!mustHavePass) {
    return {
      score: 0,
      tier: 'fail',
      reasons,
      breakdown,
      failReason: 'Must-have criteria not met',
    };
  }

  // Score strong signals
  for (const criterion of config.strongSignals) {
    maxPossibleScore += criterion.weight;
    const result = evaluateCriterion(profile, criterion);

    if (result.passes) {
      totalScore += criterion.weight;
      reasons.push(`✓ Strong signal: ${criterion.field} (${criterion.weight}pts)`);
      breakdown[`strong_${criterion.field}`] = { passes: true, score: criterion.weight };
    } else {
      reasons.push(`○ Strong signal missed: ${criterion.field}`);
      breakdown[`strong_${criterion.field}`] = { passes: false, score: 0 };
    }
  }

  // Score nice-to-haves
  for (const criterion of config.niceToHave) {
    maxPossibleScore += criterion.weight;
    const result = evaluateCriterion(profile, criterion);

    if (result.passes) {
      totalScore += criterion.weight;
      reasons.push(`+ Nice-to-have: ${criterion.field} (${criterion.weight}pts)`);
      breakdown[`nice_${criterion.field}`] = { passes: true, score: criterion.weight };
    } else {
      breakdown[`nice_${criterion.field}`] = { passes: false, score: 0 };
    }
  }

  // Check disqualifiers (any match = automatic fail)
  for (const criterion of config.disqualifiers) {
    const result = evaluateCriterion(profile, criterion);

    if (result.passes) {
      return {
        score: 0,
        tier: 'fail',
        reasons: [...reasons, `⚠️ DISQUALIFIER MATCHED: ${criterion.field}`],
        breakdown,
        failReason: `Disqualifier matched: ${criterion.field}`,
      };
    }
  }

  // Normalize score to 0-100
  const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  // Determine tier
  let tier = 'fail';
  if (normalizedScore >= config.thresholds.autoPass) {
    tier = 'auto-pass';
  } else if (normalizedScore >= config.thresholds.maybe) {
    tier = 'maybe';
  }

  return {
    score: normalizedScore,
    tier,
    reasons,
    breakdown,
    config: config.name,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Evaluate a single criterion against profile data
 * @param {Object} profile - Profile data
 * @param {Object} criterion - Criterion definition
 * @returns {Object} { passes: boolean, reason?: string }
 */
function evaluateCriterion(profile, criterion) {
  const fieldValue = getProfileField(profile, criterion.field);

  // Keyword matching
  if (criterion.keywords) {
    if (!fieldValue) return { passes: false, reason: 'Field not found' };

    const matches = criterion.keywords.some((keyword) =>
      fieldValue.toString().toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      passes: matches,
      reason: matches ? 'Keyword matched' : `No match for: ${criterion.keywords.join(', ')}`,
    };
  }

  // Numeric range matching
  if (criterion.min !== undefined || criterion.max !== undefined) {
    const value = parseFloat(fieldValue);

    if (isNaN(value)) {
      return { passes: false, reason: 'Value is not numeric' };
    }

    const passesMin = criterion.min === undefined || value >= criterion.min;
    const passesMax = criterion.max === undefined || value <= criterion.max;
    const passes = passesMin && passesMax;

    return {
      passes,
      reason: passes ? `${value} in range [${criterion.min || 'any'}, ${criterion.max || 'any'}]` : `${value} out of range`,
    };
  }

  // Boolean matching
  if (criterion.value !== undefined) {
    const matches = Boolean(fieldValue) === criterion.value;
    return {
      passes: matches,
      reason: matches ? 'Boolean condition met' : 'Boolean condition not met',
    };
  }

  return { passes: false, reason: 'Unknown criterion type' };
}

/**
 * Get nested profile field (e.g., "company_size" or "profile.location")
 */
function getProfileField(profile, fieldPath) {
  return fieldPath.split('.').reduce((obj, field) => obj?.[field], profile);
}

/**
 * Batch score multiple profiles
 * @param {Array} profiles - Array of profiles
 * @param {String} icpKey - ICP config key
 * @returns {Array} Array of scores with profiles
 */
export function scoreProfilesBatch(profiles, icpKey) {
  return profiles.map((profile) => ({
    ...profile,
    icpScore: scoreProfileAgainstICP(profile, icpKey),
  }));
}

/**
 * Get ICP summary for reporting
 * @param {Array} scores - Array of score results
 * @returns {Object} Summary statistics
 */
export function getICPSummary(scores) {
  const autoPass = scores.filter((s) => s.icpScore.tier === 'auto-pass').length;
  const maybe = scores.filter((s) => s.icpScore.tier === 'maybe').length;
  const fail = scores.filter((s) => s.icpScore.tier === 'fail').length;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.icpScore.score, 0) / scores.length) : 0;

  return {
    total: scores.length,
    autoPass,
    maybe,
    fail,
    conversionRate: `${((autoPass / scores.length) * 100).toFixed(1)}%`,
    averageScore: avgScore,
    breakdown: { autoPass, maybe, fail },
  };
}

export default {
  scoreProfileAgainstICP,
  scoreProfilesBatch,
  getICPSummary,
  DEFAULT_ICP_CONFIG,
};