// Dummy Scoring Service
export function calculateLeadScore(enrichmentData: any, engagementHistory: any) {
  // Calculate score out of 100
  let score = 50; 
  if (enrichmentData?.industry === 'Technology') score += 10;
  if (engagementHistory?.emailsOpened > 0) score += 20;
  if (engagementHistory?.emailsClicked > 0) score += 30;
  
  return Math.min(100, score);
}
