import React from 'react';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  result: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum AuditGoal {
  ENERGY = 'Energy Optimization',
  PHYSIQUE = 'Metabolic Efficiency',
  LONGEVITY = 'Executive Longevity'
}

export interface AuditState {
  age: number;
  goal: AuditGoal;
  loading: boolean;
  result: string | null;
  error: string | null;
}

export interface CliState {
  isOpen: boolean;
  input: string;
  output: Array<{ type: 'user' | 'system' | 'ai'; content: string }>;
  loading: boolean;
}

// Dashboard Types
export interface DashboardMetric {
  label: string;
  value: string;
  score?: number; // 1-5
  color?: string;
}

export interface DashboardProfile {
  name: string;
  age: number;
  maxHr: number;
  restingHr: number;
  lthr: number;
}

export type AgentMode = 'GENERAL' | 'SLEEP' | 'METABOLIC' | 'FOCUS';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  mode: AgentMode;
}