// Ideal Customer Profile definition and matching
export const defaultICP = {
  id: 'default',
  name: 'Default ICP',
  companySizeMin: 10,
  companySizeMax: 5000,
  industries: ['Fintech', 'SaaS', 'Edtech', 'B2B Services'],
  targetRoles: ['Founder', 'CEO', 'CTO', 'CFO', 'Head of Sales', 'Head of Marketing'],
  geography: ['Africa', 'Global', 'US', 'EU'],
  growthStage: ['Startup', 'Scale-up', 'Growth'],
  painPoints: ['Fundraising', 'GTM strategy', 'Financial clarity', 'Compliance', 'Team building', 'Product-market fit'],
  budget: 'Any', // Any, < $1M, $1M-$10M, $10M+
  createdAt: new Date(),
};

// ICP scoring logic
export const scoreProspectAgainstICP = (prospect, icp = defaultICP) => {
  let score = 0;
  const maxScore = 100;

  // Company size scoring (20 points)
  if (prospect.companySize) {
    if (prospect.companySize >= icp.companySizeMin && prospect.companySize <= icp.companySizeMax) {
      score += 20;
    } else if (prospect.companySize > icp.companySizeMax) {
      score += 10; // Partial credit for larger company
    }
  }

  // Industry match (20 points)
  if (prospect.industry && icp.industries.includes(prospect.industry)) {
    score += 20;
  }

  // Role match (20 points)
  if (prospect.title && icp.targetRoles.some(role => prospect.title.includes(role))) {
    score += 20;
  }

  // Pain point match (20 points)
  if (prospect.painPoint && icp.painPoints.includes(prospect.painPoint)) {
    score += 20;
  }

  // Geography match (20 points)
  if (prospect.location && icp.geography.some(geo => prospect.location.includes(geo))) {
    score += 20;
  }

  const fitLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

  return {
    score: Math.min(score, maxScore),
    fitLevel,
    breakdown: {
      companySize: prospect.companySize ? (prospect.companySize >= icp.companySizeMin && prospect.companySize <= icp.companySizeMax ? 20 : 10) : 0,
      industry: prospect.industry && icp.industries.includes(prospect.industry) ? 20 : 0,
      role: prospect.title && icp.targetRoles.some(role => prospect.title.includes(role)) ? 20 : 0,
      painPoint: prospect.painPoint && icp.painPoints.includes(prospect.painPoint) ? 20 : 0,
      geography: prospect.location && icp.geography.some(geo => prospect.location.includes(geo)) ? 20 : 0,
    }
  };
};

export default { defaultICP, scoreProspectAgainstICP };
