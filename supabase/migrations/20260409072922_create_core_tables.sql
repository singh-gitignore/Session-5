/*
  # Create AI Simulation Coach Tables

  1. New Tables
    - `scenarios` - Pre-built professional training scenarios
      - `id` (uuid, primary key)
      - `title` (text, scenario title)
      - `description` (text, detailed scenario context)
      - `category` (text, one of: workplace_conflict, leadership, crisis_management, communication)
      - `difficulty` (text, one of: easy, medium, hard)
      - `created_at` (timestamp)
    
    - `sessions` - User simulation attempts and AI feedback
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, foreign key to scenarios)
      - `user_response` (text, user's submitted response)
      - `ai_feedback` (jsonb, complete AI evaluation with 3R framework)
      - `clarity_score` (integer, 0-10)
      - `logic_score` (integer, 0-10)
      - `emotional_intelligence_score` (integer, 0-10)
      - `communication_score` (integer, 0-10)
      - `decision_quality_score` (integer, 0-10)
      - `overall_score` (integer, 0-10)
      - `next_difficulty` (text, adaptive difficulty recommendation)
      - `session_id` (text, anonymous session identifier)
      - `created_at` (timestamp)
    
    - `user_profiles` - Aggregate progress tracking per anonymous session
      - `id` (uuid, primary key)
      - `session_id` (text, unique anonymous session identifier)
      - `current_difficulty` (text, default: easy)
      - `total_attempts` (integer, default: 0)
      - `average_score` (numeric, default: 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Scenarios: Public read access
    - Sessions: Public insert/select (for anonymous users)
    - User profiles: Public read/write for anonymous sessions

  3. Indexes
    - scenarios(category, difficulty) for efficient filtering
    - sessions(scenario_id, session_id) for query performance
    - user_profiles(session_id) for profile lookups
*/

CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('workplace_conflict', 'leadership', 'crisis_management', 'communication')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_response text NOT NULL,
  ai_feedback jsonb,
  clarity_score integer CHECK (clarity_score >= 0 AND clarity_score <= 10),
  logic_score integer CHECK (logic_score >= 0 AND logic_score <= 10),
  emotional_intelligence_score integer CHECK (emotional_intelligence_score >= 0 AND emotional_intelligence_score <= 10),
  communication_score integer CHECK (communication_score >= 0 AND communication_score <= 10),
  decision_quality_score integer CHECK (decision_quality_score >= 0 AND decision_quality_score <= 10),
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 10),
  next_difficulty text CHECK (next_difficulty IN ('easy', 'medium', 'hard')),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  current_difficulty text NOT NULL DEFAULT 'easy' CHECK (current_difficulty IN ('easy', 'medium', 'hard')),
  total_attempts integer NOT NULL DEFAULT 0,
  average_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scenarios are publicly readable"
  ON scenarios
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Sessions are publicly insertable"
  ON sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Sessions are publicly readable"
  ON sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "User profiles are publicly readable"
  ON user_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "User profiles are publicly insertable"
  ON user_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "User profiles are publicly updatable"
  ON user_profiles
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX scenarios_category_difficulty ON scenarios(category, difficulty);
CREATE INDEX sessions_scenario_session ON sessions(scenario_id, session_id);
CREATE INDEX user_profiles_session_id ON user_profiles(session_id);
