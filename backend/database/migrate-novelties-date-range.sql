-- Migration: Add date range fields to novelties table
-- Purpose: Allow novelties to span multiple days (e.g., medical leave from Dec 7 to Dec 14)

-- Add new columns for date range
ALTER TABLE novelties
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Migrate existing data: set start_date and end_date from existing date field
UPDATE novelties
SET start_date = date, end_date = date
WHERE start_date IS NULL;

-- Make start_date NOT NULL now that we've migrated data
ALTER TABLE novelties
ALTER COLUMN start_date SET NOT NULL;

-- Add a check constraint to ensure end_date >= start_date
ALTER TABLE novelties
ADD CONSTRAINT chk_date_range CHECK (end_date >= start_date);

-- Create an index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_novelties_date_range ON novelties(start_date, end_date);

-- Display the updated structure
\d novelties
