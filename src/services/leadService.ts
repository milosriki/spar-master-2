// Spark Mastery — Lead Capture Service
// Lead scoring and persistence (future: Supabase spark_leads table)

import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  ageRange?: string;
  location?: string;
  source: string;
  score: number;
  createdAt: string;
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  goal?: string;
  ageRange?: string;
  location?: string;
  source: string;
}

/**
 * Calculate a 0-100 lead score based on completeness and qualification signals.
 */
export const calculateLeadScore = (lead: LeadInput): number => {
  let score = 10; // Base score for submitting

  // Contact completeness
  if (lead.phone) score += 20;
  if (lead.goal && lead.goal.length > 20) score += 20;

  // Target demographic signals
  if (lead.ageRange) {
    if (lead.ageRange === '40-50' || lead.ageRange === '35-45') score += 30;
    else if (lead.ageRange === '30-40' || lead.ageRange === '45-55') score += 20;
    else score += 10;
  }

  // Location signals (Dubai high-value areas)
  if (lead.location) {
    const highValue = ['business bay', 'difc', 'downtown', 'marina', 'palm'];
    const loc = lead.location.toLowerCase();
    if (highValue.some(area => loc.includes(area))) score += 30;
    else score += 10;
  }

  return Math.min(100, score);
};

/**
 * Create a lead in Supabase (with localStorage fallback).
 */
export const createLead = async (input: LeadInput): Promise<Lead> => {
  const score = calculateLeadScore(input);
  const lead: Lead = {
    id: `lead_${Date.now()}`,
    ...input,
    score,
    createdAt: new Date().toISOString(),
  };

  try {
    // Try Supabase first
    const { error } = await supabase.from('spark_leads').insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      fitness_goal: lead.goal || null,
      lead_source: lead.source,
      lead_score: lead.score,
      status: score >= 50 ? 'qualified' : 'new',
    });

    if (error) {
      console.warn('Supabase insert failed, falling back to localStorage:', error.message);
      saveToLocalStorage(lead);
    }
  } catch {
    console.warn('Supabase unavailable, saving locally');
    saveToLocalStorage(lead);
  }

  return lead;
};

/**
 * Fetch qualified leads (score >= 50).
 */
export const getQualifiedLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('spark_leads')
      .select('*')
      .gte('lead_score', 50)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getLocalLeads().filter(l => l.score >= 50);
    }

    return data.map(row => ({
      id: row.id,
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || undefined,
      goal: row.fitness_goal || undefined,
      source: row.lead_source || 'unknown',
      score: row.lead_score || 0,
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return getLocalLeads().filter(l => l.score >= 50);
  }
};

// localStorage fallback
const LEADS_STORAGE_KEY = 'sparkLeads';

const saveToLocalStorage = (lead: Lead) => {
  const existing = JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || '[]');
  existing.push(lead);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existing));
};

const getLocalLeads = (): Lead[] => {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
