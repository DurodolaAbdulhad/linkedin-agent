// ICP Scoring Engine
const ICP = {
  targetTitles: ['Founder', 'CEO', 'CTO', 'CMO', 'COO', 'Director', 'Head of', 'VP', 'Co-Founder'],
  targetRegions: ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Ethiopia', 'Rwanda', 'Uganda', 'Africa'],
  targetIndustries: ['Fintech', 'Healthtech', 'Edtech', 'Logistics', 'Agtech', 'SaaS', 'Tech', 'Startup'],
  fundingStages: ['Pre-seed', 'Seed', 'Series A', 'Early stage', 'Bootstrapped'],
};

export const scoreProspectAgainstICP = (profile) => {
  let score = 0;
  const breakdown = {};

  // Title match (30 pts)
  const title = (profile.title || '').toLowerCase();
  const titleMatch = ICP.targetTitles.some(t => title.includes(t.toLowerCase()));
  breakdown.title = titleMatch ? 30 : 0;
  score += breakdown.title;

  // Region match (25 pts)
  const location = (profile.location || profile.country || '').toLowerCase();
  const regionMatch = ICP.targetRegions.some(r => location.includes(r.toLowerCase()));
  breakdown.region = regionMatch ? 25 : 0;
  score += breakdown.region;

  // Industry match (25 pts)
  const company = (profile.company || profile.industry || '').toLowerCase();
  const industryMatch = ICP.targetIndustries.some(i => company.includes(i.toLowerCase()));
  breakdown.industry = industryMatch ? 25 : 0;
  score += breakdown.industry;

  // Pain point (20 pts)
  const hasPainPoint = !!(profile.painPoint && profile.painPoint !== 'unknown');
  breakdown.painPoint = hasPainPoint ? 20 : 0;
  score += breakdown.painPoint;

  const fitLevel = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low';

  return { score, fitLevel, breakdown };
};
