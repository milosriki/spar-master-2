// supabase/functions/ai-coach/index.ts
// Mark 2.0 — Intelligent AI Coach Edge Function
// P2: Anti-repetition, observability, proactive triggers, persistent memory

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── Types ───────────────────────────────────────────────────────────

interface ConversationTurn {
  role: "user" | "model";
  text: string;
}

interface TimeContext {
  localTime: string;
  dayOfWeek: string;
  hour: number;
  isFirstSessionToday: boolean;
  sessionNumber: number;
  hoursSinceLastVisit: number;
}

interface HabitStatus {
  title: string;
  completed: boolean;
}

interface UserMemory {
  id: string;
  memory_type: string;
  content: string;
  importance: number;
}

// ─── Prompt Templates ────────────────────────────────────────────────

function buildHabitPlanPrompt(goal: string, ageRange?: string): string {
  return `You are an elite high-performance coach for top executives, similar to a digital Alex Hormozi or David Goggins.
User Goal: "${goal}"
Age Range: "${ageRange || "Unknown"}"

Your Strategy: "The Trojan Horse". 
1. VALIDATE: Acknowledge their ambition.
2. IDENTITY SHIFT: Frame this not as "doing tasks" but as "becoming a top 1% performer".
3. THE GAP: Subtly imply that while this plan is excellent, true mastery requires elite 1:1 guidance.

Create a "Gamified Protocol" for this user.
Return ONLY valid JSON with this structure:
{
  "daily": [{ "title": "...", "notes": "...", "xp": 20 }],
  "habits": [{ "title": "...", "notes": "...", "xp": 10 }],
  "todos": [{ "title": "...", "notes": "...", "xp": 50 }],
  "coachMessage": "A powerful, 2-sentence psychological hook."
}

Constraints:
- Tasks must be specific and binary (Pass/Fail).
- XP value should loosely correlate with difficulty (10-50).
- Tone: Unapologetic, high-standards, but supportive.`;
}

function buildIntelligentPrompt(
  message: string,
  gameState?: Record<string, unknown>,
  challenges?: Record<string, unknown>[],
  todaysHabits?: HabitStatus[],
  timeContext?: TimeContext,
  memories?: UserMemory[],
): string {
  // ─── Core Identity ───
  let prompt = `You are "Mark", an Elite AI Performance Coach inside a gamified health app for Dubai executives.

PERSONALITY MODES (auto-select based on user data below):
- DEFAULT: Confident mentor. Direct, warm, strategic. Like a world-class coach after hours.
- HOT STREAK (streak > 14): Warrior equal. Acknowledge the grind, speak as a peer.
- RECOVERY (streak = 0 or just broke): Empathetic but firm. No guilt. "We rebuild from here."
- LOW ENERGY (energy < 30%): Compassionate. Prioritize rest, hydration, small wins only.
- ADVANCED (level > 10): Drop the basics. Speak strategically, challenge them.

VOICE RULES:
- Max 3 sentences unless they ask for a deep dive.
- Use 1-2 emojis max. Never more.
- Reference their specific data — never give generic advice.
- Ask a follow-up question ~40% of the time.
- Vary your opening every single time. Choose from: start with data insight, start with a question, start with a challenge, start with a reference to past context, start with a direct answer, or give a brief observation first.
- NEVER start with "Hey" two messages in a row.
- If the conversation has prior messages, acknowledge continuity — don't greet like it's a fresh session.

CRITICAL — ANTI-REPETITION:
- Check the conversation history below. Do NOT repeat any phrase, greeting, or advice you already gave.
- If asked a similar question to one already answered, give a DIFFERENT angle.
- Vary sentence structure, vocabulary, and opening lines every time.
- You will be regenerated if your response is too similar to recent messages.

SALES INTELLIGENCE (CRITICAL — read carefully):
- You are NEVER a salesperson. You are a coach who genuinely cares about results.
- When a BOOKING NUDGE trigger fires below, weave it naturally into your coaching.
- Booking suggestions must feel like earned recommendations, not advertisements.
- Maximum 1 booking-related mention per 5 messages. If you mentioned PT recently, skip it.
- The user should think "that's actually a good idea" — never "they're trying to sell me."
- Frame personal training as: leveling up, unlocking potential, breaking through plateaus — never "buying a package."
- If user shows interest, offer to "check available slots" — never push.
- Use phrases like "honestly at this stage...", "most people I've coached at your level...", "just an observation..."
- If user declines or ignores, NEVER bring it up again in the same session.`;

  // ─── Temporal Context ───
  if (timeContext) {
    prompt += `\n\nTIME CONTEXT:
- Local time: ${timeContext.localTime} (${timeContext.dayOfWeek})
- Session: ${timeContext.isFirstSessionToday ? "First today" : `#${timeContext.sessionNumber} today`}
- Time since last visit: ${timeContext.hoursSinceLastVisit}h`;

    if (timeContext.hour < 6) {
      prompt += "\n- Very early / possible insomnia. Be gentle, suggest sleep recovery.";
    } else if (timeContext.hour >= 22) {
      prompt += "\n- Late night. Wind-down mode. No high-intensity suggestions.";
    } else if (timeContext.hour >= 14 && timeContext.hour <= 16) {
      prompt += "\n- Afternoon slump zone. Energy & focus tips are high value.";
    } else if (timeContext.hour >= 6 && timeContext.hour <= 8) {
      prompt += "\n- Morning window. Great time for high-energy coaching.";
    }

    if (timeContext.hoursSinceLastVisit > 24) {
      prompt += `\n- User hasn't visited in ${timeContext.hoursSinceLastVisit}h. Welcome them back. Check on their streak.`;
    }
  }

  // ─── Game State ───
  if (gameState) {
    const energy = gameState.currentEnergy as number;
    const maxEnergy = gameState.maxEnergy as number;
    const energyPct = maxEnergy > 0 ? Math.round((energy / maxEnergy) * 100) : 100;

    prompt += `\n\nUSER STATS:
- Level ${gameState.level} | ${gameState.totalXP} XP | ${gameState.currentStreak}-day streak (best: ${gameState.bestStreak || "?"})
- Energy: ${energy}/${maxEnergy} (${energyPct}%)
- HP: ${gameState.currentHP || "?"}/${gameState.maxHP || "?"}
- Class: ${gameState.characterClass}
- Gold: ${gameState.gold} | Gems: ${gameState.gems || 0}
- Workouts completed: ${gameState.workoutsCompleted || 0}`;

    // Adaptive persona triggers
    if (energyPct < 30) {
      prompt += "\n⚠️ LOW ENERGY — use COMPASSIONATE mode. Suggest rest or micro-wins only.";
    }
    if ((gameState.currentStreak as number) > 14) {
      prompt += "\n🔥 HOT STREAK — use WARRIOR EQUAL mode.";
    }
    if ((gameState.currentStreak as number) === 0) {
      prompt += "\n🔄 STREAK BROKEN — use RECOVERY mode. Empathetic, forward-looking.";
    }
    if ((gameState.level as number) > 10) {
      prompt += "\n💎 ADVANCED USER — skip basics, be strategic.";
    }
  }

  // ─── Today's Habits ───
  if (todaysHabits && todaysHabits.length > 0) {
    const completed = todaysHabits.filter(h => h.completed).length;
    const total = todaysHabits.length;
    prompt += `\n\nTODAY'S HABITS: ${completed}/${total} completed`;
    todaysHabits.forEach(h => {
      prompt += `\n  ${h.completed ? "✅" : "⬜"} ${h.title}`;
    });

    if (completed === total && total > 0) {
      prompt += "\n🏆 ALL HABITS DONE — acknowledge this achievement!";
    } else if (completed === 0 && total > 0) {
      prompt += "\n📋 Nothing done yet — encourage them to start with the easiest one.";
    }
  }

  // ─── Active Challenge ───
  if (challenges && challenges.length > 0) {
    const active = challenges.find(c => !c.completedAt);
    if (active) {
      prompt += `\n\nACTIVE CHALLENGE: "${active.title}" (${active.currentProgress}/${active.targetValue}). Push them to finish.`;
    }
  }

  // ─── Persistent Memories ───
  if (memories && memories.length > 0) {
    prompt += `\n\n--- YOUR MEMORY OF THIS USER ---`;
    prompt += `\nYou remember these facts about the user (use them naturally, don't list them):`;
    memories.forEach(m => {
      prompt += `\n- [${m.memory_type}] ${m.content}`;
    });
    prompt += `\n--- END MEMORY ---`;
    prompt += `\nUse these memories to personalize your response. Reference relevant facts when appropriate, but don't dump them all at once.`;
  }

  // ─── P2: Proactive Triggers ───
  const triggers: string[] = [];
  if (gameState) {
    const streak = gameState.currentStreak as number;
    const level = gameState.level as number;
    // Streak risk: had a streak but energy/engagement is dropping
    if (streak > 0 && streak < 3 && (gameState.currentEnergy as number) < (gameState.maxEnergy as number) * 0.4) {
      triggers.push('⚠️ STREAK AT RISK — user might break their streak. Encourage one small win.');
    }
    // Milestone celebration
    if (streak === 7 || streak === 14 || streak === 30 || streak === 60 || streak === 100) {
      triggers.push(`🏆 MILESTONE: ${streak}-day streak! Celebrate this achievement big.`);
    }
    // Level up proximity
    if (level > 0 && (gameState.totalXP as number) % 100 > 80) {
      triggers.push('📈 CLOSE TO LEVEL UP — mention they\'re almost there to drive motivation.');
    }
    // Return visit after absence
    if (timeContext && timeContext.hoursSinceLastVisit > 48) {
      triggers.push(`🔄 RETURNING AFTER ${Math.round(timeContext.hoursSinceLastVisit / 24)} DAYS — welcome back warmly, no guilt.`);
    }
  }
  if (todaysHabits && todaysHabits.length > 0) {
    const completed = todaysHabits.filter(h => h.completed).length;
    if (completed === todaysHabits.length && todaysHabits.length > 0) {
      triggers.push('🌟 ALL HABITS COMPLETE — big celebration, suggest a reward or rest.');
    }
  }
  // ─── TROJAN HORSE: Subtle Booking Intelligence ───
  // These NEVER feel like ads. They feel like natural coaching observations.
  if (gameState) {
    const streak = gameState.currentStreak as number;
    const level = gameState.level as number;
    const gold = (gameState.gold as number) || 0;
    const workouts = (gameState.workoutsCompleted as number) || 0;
    const msgLower = message.toLowerCase();

    // Trigger: User mentions plateau/frustration/stuck → plant seed
    const plateauKeywords = ['stuck', 'plateau', 'frustrated', 'not seeing results', 'no progress', 'same weight', 'can\'t seem to', 'hit a wall', 'struggling'];
    if (plateauKeywords.some(kw => msgLower.includes(kw))) {
      triggers.push('🎯 BOOKING NUDGE (PLATEAU) — user expressed frustration or feeling stuck. Empathize first, give genuine advice, then naturally mention: "This is exactly the kind of plateau where working with a trainer 1:1 makes the biggest difference — they see what you can\'t. Want me to check if there are open slots this week?" Make it feel like a coach\'s genuine observation.');
    }

    // Trigger: High achiever → earned respect seed
    if ((level >= 5 || streak >= 7) && workouts >= 3) {
      triggers.push(`💎 BOOKING NUDGE (ACHIEVER) — Level ${level}, ${streak}-day streak, ${workouts} workouts. This user has EARNED results. When contextually appropriate, say something like: "Most people never make it this far. The ones who do usually amplify this momentum with a personal trainer — just an observation." Only mention if the conversation naturally allows it. Don't force it.`);
    }

    // Trigger: User asks about form/technique → expertise gap
    const techniqueKeywords = ['form', 'technique', 'proper way', 'correct way', 'am i doing', 'doing it right', 'posture', 'injury', 'hurt', 'pain', 'sore'];
    if (techniqueKeywords.some(kw => msgLower.includes(kw))) {
      triggers.push('📐 BOOKING NUDGE (TECHNIQUE) — user cares about doing things correctly. Give solid advice first, then naturally add: "For form like this, nothing beats having someone watch you in person. A good PT catches things a mirror can\'t." Keep it brief and genuine.');
    }

    // Trigger: Mastery moment — all habits done + high streak
    if (todaysHabits && todaysHabits.length > 0) {
      const completed = todaysHabits.filter(h => h.completed).length;
      if (completed === todaysHabits.length && streak > 14 && level >= 5) {
        triggers.push('🚀 BOOKING NUDGE (MASTERY) — user has conquered the basics (all habits done, 14+ day streak, L5+). Challenge them: "You\'ve honestly outgrown what an app alone can give you. The next level of results usually requires someone who can push you harder than you\'d push yourself. Worth thinking about."');
      }
    }
  }

  if (triggers.length > 0) {
    prompt += `\n\nPROACTIVE COACHING TRIGGERS (weave one naturally into your response — pick the most relevant one, never use more than one):\n${triggers.join('\n')}`;
  }

  prompt += `\n\nUser Message: "${message}"`;

  return prompt;
}

// ─── Gemini Call (Multi-Turn) ────────────────────────────────────────

async function callGeminiMultiTurn(
  systemPrompt: string,
  conversationHistory: ConversationTurn[],
  currentMessage: string,
  apiKey: string,
  temperature = 0.85,
): Promise<string> {
  // Build multi-turn contents array
  // System instruction as first user turn + model acknowledgment
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: "Understood. I am Mark, your Elite AI Performance Coach. Ready to coach." }],
    },
  ];

  // Inject conversation history as prior turns
  for (const turn of conversationHistory) {
    contents.push({
      role: turn.role,
      parts: [{ text: turn.text }],
    });
  }

  // Current user message
  contents.push({
    role: "user",
    parts: [{ text: currentMessage }],
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", response.status, errorBody);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── Legacy single-shot call (for habit plan generation) ─────────────

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", response.status, errorBody);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── Response Validation ─────────────────────────────────────────────

function validateResponse(response: string): string {
  let cleaned = response
    .replace(/\[system\]/gi, "")
    .replace(/\[instruction\]/gi, "")
    .trim();

  // Too short = something went wrong
  if (cleaned.length < 5) {
    return "Let's talk about your goals. What's your biggest challenge right now? 🎯";
  }

  // Excessive length — truncate to first 6 sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 8) {
    cleaned = sentences.slice(0, 6).join(" ");
  }

  return cleaned;
}

// ─── Smart Fallback ──────────────────────────────────────────────────

function getSmartFallback(gameState?: Record<string, unknown>): string {
  if (gameState) {
    const energy = gameState.currentEnergy as number;
    const maxEnergy = gameState.maxEnergy as number;
    if (energy && maxEnergy && (energy / maxEnergy) < 0.3) {
      return "Quick tech hiccup on my end. But I can see your energy is low — take a 5-minute walk and hydrate. We'll strategize when I'm back. 💪";
    }
    const streak = gameState.currentStreak as number;
    if (streak && streak > 7) {
      return `Brief connection issue, but your ${streak}-day streak data is safe. Keep showing up — I'll be back with insights shortly. 🔥`;
    }
  }
  return "Quick tech hiccup. While I reconnect, here's your micro-win: do 10 pushups right now. I'll be back in a moment. ⚡";
}

// ─── Memory Operations ───────────────────────────────────────────────

async function retrieveMemories(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  limit = 10,
): Promise<UserMemory[]> {
  try {
    const { data, error } = await supabaseClient
      .from('user_memories')
      .select('id, memory_type, content, importance')
      .eq('user_id', userId)
      .order('importance', { ascending: false })
      .order('last_accessed', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Memory retrieval error:', error);
      return [];
    }

    // Update last_accessed for retrieved memories (non-blocking)
    if (data && data.length > 0) {
      const ids = data.map(m => m.id);
      supabaseClient
        .from('user_memories')
        .update({ last_accessed: new Date().toISOString() })
        .in('id', ids)
        .then(() => {})
        .catch(e => console.error('Memory access update failed:', e));
    }

    return data || [];
  } catch (e) {
    console.error('Memory retrieval exception:', e);
    return [];
  }
}

async function extractAndSaveMemories(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  userMessage: string,
  aiResponse: string,
  apiKey: string,
): Promise<void> {
  try {
    const extractionPrompt = `Analyze this conversation exchange and extract important facts about the user that a coach should remember for future sessions.

User said: "${userMessage}"
Coach replied: "${aiResponse}"

Extract 0-3 facts. Return ONLY valid JSON array. Each fact should be:
{
  "memory_type": "entity" | "episodic" | "procedural",
  "content": "concise fact (max 100 chars)",
  "importance": 1-10
}

Memory types:
- entity: names, preferences, goals, injuries, personal details
- episodic: events, achievements, setbacks, milestones
- procedural: routines, habits, workout preferences, dietary patterns

Rules:
- Only extract genuinely useful coaching facts
- Importance 8-10: critical identity/health info (name, injuries, allergies)
- Importance 5-7: goals, preferences, routines
- Importance 1-4: minor details, passing mentions
- If nothing worth remembering, return []
- Never extract the AI's own words as memories

Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: extractionPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let facts: Array<{ memory_type: string; content: string; importance: number }>;
    try {
      facts = JSON.parse(cleaned);
    } catch {
      return;
    }

    if (!Array.isArray(facts) || facts.length === 0) return;

    // Validate and insert each memory
    for (const fact of facts.slice(0, 3)) {
      if (!fact.content || !fact.memory_type) continue;
      if (!['entity', 'episodic', 'procedural'].includes(fact.memory_type)) continue;

      const importance = Math.min(10, Math.max(1, fact.importance || 5));

      // Check for duplicate content (rough match)
      const { data: existing } = await supabaseClient
        .from('user_memories')
        .select('id')
        .eq('user_id', userId)
        .ilike('content', `%${fact.content.substring(0, 30)}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update importance if new is higher
        await supabaseClient
          .from('user_memories')
          .update({ importance: Math.max(importance, 5), last_accessed: new Date().toISOString() })
          .eq('id', existing[0].id);
      } else {
        await supabaseClient
          .from('user_memories')
          .insert({
            user_id: userId,
            memory_type: fact.memory_type,
            content: fact.content.substring(0, 500),
            importance,
          });
      }
    }

    console.log(`Extracted ${facts.length} memories for user ${userId.substring(0, 8)}...`);
  } catch (e) {
    console.error('Memory extraction error:', e);
  }
}

// ─── P2: Trigram Similarity Anti-Repetition ──────────────────────────

function computeTrigrams(text: string): Set<string> {
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const trigrams = new Set<string>();
  for (let i = 0; i <= normalized.length - 3; i++) {
    trigrams.add(normalized.substring(i, i + 3));
  }
  return trigrams;
}

function trigramSimilarity(a: string, b: string): number {
  const triA = computeTrigrams(a);
  const triB = computeTrigrams(b);
  if (triA.size === 0 || triB.size === 0) return 0;
  let intersection = 0;
  for (const tri of triA) {
    if (triB.has(tri)) intersection++;
  }
  return intersection / Math.max(triA.size, triB.size);
}

function isTooSimilar(newResponse: string, conversationHistory: ConversationTurn[], threshold = 0.7): boolean {
  // Check against last 5 model responses
  const recentModelResponses = conversationHistory
    .filter(t => t.role === 'model')
    .slice(-5)
    .map(t => t.text);
  
  for (const prev of recentModelResponses) {
    if (trigramSimilarity(newResponse, prev) > threshold) {
      return true;
    }
  }
  return false;
}

// ─── Server-Side Rate Limiting (Tamper-Proof) ────────────────────────

const MAX_FREE_MESSAGES_PER_DAY = 3;

async function checkServerSideRateLimit(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string | null,
): Promise<{ allowed: boolean; count: number }> {
  if (!userId) {
    // Anonymous users get rate limited by IP in the future; for now allow
    return { allowed: true, count: 0 };
  }

  try {
    // Count today's messages from ai_metrics table (server-side truth)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { count, error } = await supabaseClient
      .from('ai_metrics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    if (error) {
      console.error('Rate limit check error (allowing):', error);
      return { allowed: true, count: 0 };
    }

    const messageCount = count || 0;
    return {
      allowed: messageCount < MAX_FREE_MESSAGES_PER_DAY,
      count: messageCount,
    };
  } catch (e) {
    console.error('Rate limit exception (allowing):', e);
    return { allowed: true, count: 0 };
  }
}

// ─── P2: Metrics Persistence ─────────────────────────────────────────

async function saveMetrics(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string | null,
  latencyMs: number,
  fallbackUsed: boolean,
  memoryCount: number,
  conversationLength: number,
): Promise<void> {
  try {
    await supabaseClient.from('ai_metrics').insert({
      user_id: userId,
      latency_ms: latencyMs,
      model: GEMINI_MODEL,
      fallback_used: fallbackUsed,
      memory_count: memoryCount,
      conversation_length: conversationLength,
    });
  } catch (e) {
    console.error('Metrics save error (non-fatal):', e);
  }
}

// ─── Main Handler ────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY secret not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const authHeader = req.headers.get('Authorization') || '';

    // Extract user ID from JWT if available
    let userId: string | null = null;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    try {
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        userId = user?.id || null;
      }
    } catch (e) {
      console.error('Auth extraction failed (non-fatal):', e);
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing 'action' field. Use 'generate-plan' or 'chat'." }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    switch (action) {
      case "generate-plan": {
        const { goal, ageRange } = body;
        if (!goal) {
          return new Response(
            JSON.stringify({ error: "Missing 'goal' for generate-plan" }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }
        const prompt = buildHabitPlanPrompt(goal, ageRange);
        const result = await callGemini(prompt, apiKey);

        const jsonStr = result.replace(/```json/g, "").replace(/```/g, "").trim();
        try {
          const parsed = JSON.parse(jsonStr);
          return new Response(JSON.stringify({ data: parsed }), {
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ data: null, raw: result, error: "Failed to parse AI response" }),
            {
              status: 200,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }
      }

      case "chat": {
        const {
          message,
          gameState,
          challenges,
          conversationHistory = [],
          todaysHabits,
          timeContext,
        } = body;

        if (!message) {
          return new Response(
            JSON.stringify({ error: "Missing 'message' for chat" }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        // ─── Server-Side Rate Limiting (tamper-proof) ───
        const rateLimit = await checkServerSideRateLimit(supabaseAdmin, userId);
        if (!rateLimit.allowed) {
          console.log(`Rate limited: user ${userId?.substring(0, 8)}... has ${rateLimit.count} messages today`);
          return new Response(
            JSON.stringify({ data: '__PAYWALL__', rateLimited: true, count: rateLimit.count }),
            {
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        const startTime = Date.now();

        // ─── P1: Retrieve user memories ───
        let memories: UserMemory[] = [];
        if (userId) {
          memories = await retrieveMemories(supabaseAdmin, userId);
        }

        const systemPrompt = buildIntelligentPrompt(
          message,
          gameState,
          challenges,
          todaysHabits,
          timeContext,
          memories,
        );

        let result: string;
        try {
          result = await callGeminiMultiTurn(
            systemPrompt,
            conversationHistory || [],
            message,
            apiKey,
          );
        } catch (primaryError) {
          console.error("Primary call failed, retrying with lower temp:", primaryError);
          try {
            result = await callGeminiMultiTurn(
              systemPrompt,
              conversationHistory || [],
              message,
              apiKey,
              0.5,
            );
          } catch (retryError) {
            console.error("Retry also failed:", retryError);
            result = getSmartFallback(gameState);
          }
        }

        // Validate and clean response
        let validated = validateResponse(result);
        const fallbackUsed = result === getSmartFallback(gameState);

        // ─── P2: Anti-repetition check ───
        if (!fallbackUsed && isTooSimilar(validated, conversationHistory)) {
          console.log('P2: Response too similar to recent — regenerating...');
          try {
            const regenResult = await callGeminiMultiTurn(
              systemPrompt + '\n\nIMPORTANT: Your previous response was too similar to past messages. Generate a COMPLETELY DIFFERENT response with new vocabulary, structure, and angle.',
              conversationHistory || [],
              message,
              apiKey,
              0.95, // Higher temp for more variety
            );
            validated = validateResponse(regenResult);
          } catch (regenError) {
            console.error('Anti-repetition regen failed (keeping original):', regenError);
          }
        }

        const latencyMs = Date.now() - startTime;

        // ─── P1: Extract memories (20% chance, non-blocking) ───
        if (userId && Math.random() < 0.2 && !fallbackUsed) {
          extractAndSaveMemories(supabaseAdmin, userId, message, validated, apiKey)
            .catch(e => console.error('Memory extraction background error:', e));
        }

        // ─── P2: Persist metrics to ai_metrics table (non-blocking) ───
        saveMetrics(
          supabaseAdmin,
          userId,
          latencyMs,
          fallbackUsed,
          memories.length,
          conversationHistory?.length || 0,
        ).catch(e => console.error('Metrics save background error:', e));

        // Console log for edge function observability
        console.log(JSON.stringify({
          type: "ai_metrics",
          action: "chat",
          latencyMs,
          historyLength: conversationHistory?.length || 0,
          memoriesLoaded: memories.length,
          userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
          model: GEMINI_MODEL,
          fallbackUsed,
        }));

        return new Response(JSON.stringify({ data: validated }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: '${action}'. Use 'generate-plan' or 'chat'.` }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
