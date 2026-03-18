-- Growth System Migration
-- Adds tables for starter rewards, referral events, founder members,
-- and extends the users table with growth-related columns.

-- ─── 1. Extend users table ────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founder        BOOLEAN  DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_sequence  INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ambassador     BOOLEAN  DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_status TEXT     DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_applied_at  TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_approved_at TIMESTAMP;

-- ─── 2. Starter rewards (one record per user, idempotent) ────────────────────
CREATE TABLE IF NOT EXISTS starter_rewards (
  id                  VARCHAR  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             VARCHAR  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              TEXT     NOT NULL DEFAULT 'active',   -- active | expired | revoked
  hashrate            REAL     NOT NULL DEFAULT 0.5,
  hashrate_unit       TEXT     NOT NULL DEFAULT 'TH/s',
  crypto              TEXT     NOT NULL DEFAULT 'BTC',
  duration_days       INTEGER  NOT NULL DEFAULT 30,
  daily_return_btc    REAL     NOT NULL DEFAULT 0.000001,
  total_earned        REAL     NOT NULL DEFAULT 0,
  qualifying_event    TEXT     NOT NULL DEFAULT 'signup',
  mining_purchase_id  VARCHAR  REFERENCES mining_purchases(id),
  granted_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  activated_at        TIMESTAMP,
  expires_at          TIMESTAMP,
  revoked_at          TIMESTAMP,
  revocation_reason   TEXT,
  CONSTRAINT starter_rewards_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_starter_rewards_user ON starter_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_starter_rewards_status ON starter_rewards(status);

-- ─── 3. Referral events (full attribution funnel) ────────────────────────────
CREATE TABLE IF NOT EXISTS referral_events (
  id                VARCHAR  PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       VARCHAR  NOT NULL REFERENCES users(id),
  referred_user_id  VARCHAR  NOT NULL REFERENCES users(id),
  referral_code     TEXT     NOT NULL,
  event_type        TEXT     NOT NULL,  -- attributed | signup | qualified | reward_issued
  event_data        JSONB,
  reward_issued     BOOLEAN  NOT NULL DEFAULT false,
  reward_amount     REAL,
  reward_currency   TEXT,
  idempotency_key   TEXT     UNIQUE,    -- referrer_id + ':' + referred_user_id + ':reward'
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  qualified_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer   ON referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred   ON referral_events(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_type       ON referral_events(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_idem       ON referral_events(idempotency_key);

-- ─── 4. Founder members ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS founder_members (
  id                VARCHAR  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           VARCHAR  NOT NULL REFERENCES users(id) UNIQUE,
  sequence          INTEGER  NOT NULL,
  tier              TEXT     NOT NULL DEFAULT 'founding',  -- founding | early | community
  badge_granted_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  benefits          JSONB,
  is_active         BOOLEAN  NOT NULL DEFAULT true,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_founder_members_seq  ON founder_members(sequence);
CREATE INDEX        IF NOT EXISTS idx_founder_members_user ON founder_members(user_id);

-- ─── 5. Growth badges (earned badges per user) ────────────────────────────────
CREATE TABLE IF NOT EXISTS growth_badges (
  id           VARCHAR  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_slug   TEXT     NOT NULL,  -- starter_miner | founder | first_referral | milestone_*
  badge_name   TEXT     NOT NULL,
  badge_level  INTEGER  NOT NULL DEFAULT 1,
  earned_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata     JSONB,
  CONSTRAINT growth_badges_user_badge UNIQUE (user_id, badge_slug)
);

CREATE INDEX IF NOT EXISTS idx_growth_badges_user ON growth_badges(user_id);

-- ─── 6. Seed default app_settings for growth config ──────────────────────────
INSERT INTO app_settings (key, value, type, description)
VALUES
  ('starter_hashrate_ths',    '0.5',   'number',  'Starter miner hashrate in TH/s'),
  ('starter_duration_days',   '30',    'number',  'Starter miner duration in days'),
  ('starter_daily_return_btc','0.000001','number', 'Starter miner daily BTC return estimate'),
  ('founder_cap',             '500',   'number',  'Maximum number of founding members'),
  ('referral_reward_usd',     '10',    'number',  'Referral reward in USD equivalent (USDT)'),
  ('referral_qualify_min_usd','50',    'number',  'Minimum purchase USD to qualify a referral'),
  ('growth_enabled',          'true',  'boolean', 'Master switch for growth features')
ON CONFLICT (key) DO NOTHING;
