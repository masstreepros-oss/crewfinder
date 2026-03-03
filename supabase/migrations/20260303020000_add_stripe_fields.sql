-- Add Stripe subscription fields to profiles table
-- Run this migration to enable subscription billing

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free';

-- Index for quick lookups by stripe_customer_id (used in webhook handlers)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status) WHERE subscription_status != 'free';

COMMENT ON COLUMN profiles.subscription_status IS 'Subscription state: free, active, past_due, cancelled';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing portal and webhook matching';
COMMENT ON COLUMN profiles.subscription_id IS 'Stripe subscription ID for cancellation';
COMMENT ON COLUMN profiles.current_period_end IS 'When the current billing period ends';
COMMENT ON COLUMN profiles.plan_type IS 'Plan type: free, monthly, annual';
