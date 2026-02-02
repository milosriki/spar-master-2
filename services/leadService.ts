/**
 * Lead Service - Manages lead generation and qualification
 */

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  ageRange?: string;
  location?: string;
  source: string; // 'ai-chat', 'form', 'audit', etc.
  qualified: boolean;
  score: number; // 0-100
  notes?: string;
  createdAt: string;
  lastContact?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  ageRange?: string;
  location?: string;
  source: string;
  notes?: string;
}

/**
 * Calculate lead qualification score based on various factors
 */
const calculateLeadScore = (lead: LeadInput): number => {
  let score = 0;
  
  // Has phone number (+20 points)
  if (lead.phone) score += 20;
  
  // Has specific goal (+20 points)
  if (lead.goal && lead.goal.length > 10) score += 20;
  
  // Age range indicates target demographic (+30 points)
  if (lead.ageRange && (lead.ageRange.includes('40') || lead.ageRange.includes('50'))) {
    score += 30;
  }
  
  // Location is Dubai/UAE (+30 points)
  if (lead.location && (lead.location.toLowerCase().includes('dubai') || lead.location.toLowerCase().includes('uae'))) {
    score += 30;
  }
  
  return Math.min(score, 100);
};

/**
 * Create a new lead
 */
export const createLead = async (leadData: LeadInput): Promise<Lead> => {
  const leadId = `LEAD-${Date.now()}`;
  const score = calculateLeadScore(leadData);
  
  const lead: Lead = {
    id: leadId,
    ...leadData,
    qualified: score >= 50,
    score,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  
  // Store in localStorage (in production, this would go to a backend)
  const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
  existingLeads.push(lead);
  localStorage.setItem('leads', JSON.stringify(existingLeads));
  
  // Track in analytics (placeholder)
  trackLeadEvent('lead_created', lead);
  
  return lead;
};

/**
 * Update lead status
 */
export const updateLeadStatus = (leadId: string, status: Lead['status']): boolean => {
  try {
    const leads = JSON.parse(localStorage.getItem('leads') || '[]');
    const updatedLeads = leads.map((lead: Lead) => 
      lead.id === leadId 
        ? { ...lead, status, lastContact: new Date().toISOString() }
        : lead
    );
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    return true;
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return false;
  }
};

/**
 * Get all leads
 */
export const getAllLeads = (): Lead[] => {
  return JSON.parse(localStorage.getItem('leads') || '[]');
};

/**
 * Get qualified leads (score >= 50)
 */
export const getQualifiedLeads = (): Lead[] => {
  const leads = getAllLeads();
  return leads.filter(lead => lead.qualified);
};

/**
 * Get lead by email
 */
export const getLeadByEmail = (email: string): Lead | null => {
  const leads = getAllLeads();
  return leads.find(lead => lead.email === email) || null;
};

/**
 * Track lead events (placeholder for analytics)
 */
const trackLeadEvent = (event: string, data: any) => {
  console.log(`[Lead Event] ${event}:`, data);
  // In production, integrate with analytics service
};

/**
 * Qualify a lead through AI conversation
 */
export const qualifyLeadFromConversation = (
  conversationData: {
    messages: string[];
    userInfo: Partial<LeadInput>;
  }
): number => {
  let score = calculateLeadScore(conversationData.userInfo as LeadInput);
  
  // Analyze conversation for engagement indicators
  const messageCount = conversationData.messages.length;
  if (messageCount > 3) score += 10;
  if (messageCount > 7) score += 10;
  
  // Check for buying signals in messages
  const allMessages = conversationData.messages.join(' ').toLowerCase();
  if (allMessages.includes('book') || allMessages.includes('schedule')) score += 15;
  if (allMessages.includes('ready') || allMessages.includes('commit')) score += 10;
  if (allMessages.includes('when') || allMessages.includes('how much')) score += 10;
  
  return Math.min(score, 100);
};
