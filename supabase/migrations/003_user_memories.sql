-- =============================================
-- Migration 003: User Memories for AI Coach
-- Persistent memory system for Mark 2.0
-- Made idempotent (safe to re-run)
-- =============================================

-- Memory table
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('entity', 'episodic', 'procedural')),
  content TEXT NOT NULL,
  importance SMALLINT DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  access_count INT DEFAULT 0
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memories_recent ON user_memories(user_id, last_accessed DESC);

-- RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Idempotent policies (drop-if-exists + create)
DO $$ BEGIN
  -- Users can read their own memories
  DROP POLICY IF EXISTS "Users read own memories" ON user_memories;
  CREATE POLICY "Users read own memories"
    ON user_memories FOR SELECT
    USING (auth.uid() = user_id);

  -- Users can insert their own memories
  DROP POLICY IF EXISTS "Users insert own memories" ON user_memories;
  CREATE POLICY "Users insert own memories"
    ON user_memories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Users can update their own memories (for access_count/last_accessed)
  DROP POLICY IF EXISTS "Users update own memories" ON user_memories;
  CREATE POLICY "Users update own memories"
    ON user_memories FOR UPDATE
    USING (auth.uid() = user_id);

  -- Users can delete their own memories
  DROP POLICY IF EXISTS "Users delete own memories" ON user_memories;
  CREATE POLICY "Users delete own memories"
    ON user_memories FOR DELETE
    USING (auth.uid() = user_id);

  -- Service role bypass (Edge Functions use service role key)
  DROP POLICY IF EXISTS "Service role full access" ON user_memories;
  CREATE POLICY "Service role full access"
    ON user_memories FOR ALL
    USING (auth.role() = 'service_role');
END $$;
