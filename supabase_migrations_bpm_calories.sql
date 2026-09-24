-- ==============================================================================
-- DeV Fit Migration: Heart Rate (BPM), Scientific Calories & Cardio/Run Metrics
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Add metrics columns to workout_logs
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS avg_heart_rate NUMERIC;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS heart_rate_samples JSONB;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS calories_burned NUMERIC;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS device_source TEXT;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'strength';
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS distance_km NUMERIC;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS elevation_meters NUMERIC;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS pace TEXT;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add performance index on user_id and date
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);

-- Confirmation message
SELECT 'Migration completed successfully: columns avg_heart_rate, heart_rate_samples, calories_burned, device_source, activity_type, distance_km, elevation_meters, pace, notes added to workout_logs.' AS status;
