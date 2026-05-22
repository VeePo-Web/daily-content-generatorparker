-- Add name column to saved_outfits table for outfit naming
ALTER TABLE saved_outfits ADD COLUMN name TEXT;

-- Add share_id column for shorter shareable URLs
ALTER TABLE saved_outfits ADD COLUMN share_id TEXT UNIQUE;

-- Create index for faster share_id lookups
CREATE INDEX idx_saved_outfits_share_id ON saved_outfits(share_id);