/*
  # Add Code Column to Variations and Menu Items

  1. Changes
    - Add `code` column to `variations` table (text, optional)
    - Add `code` column to `menu_items` table (text, optional)
  
  2. Purpose
    - Support product codes (e.g., B1F, B1S) for menu items and their variations.
*/

DO $$
BEGIN
  -- Add code column to variations table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'variations' AND column_name = 'code'
  ) THEN
    ALTER TABLE variations ADD COLUMN code text;
  END IF;

  -- Add code column to menu_items table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'code'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN code text;
  END IF;

  -- Create index for code columns for faster lookups
  CREATE INDEX IF NOT EXISTS idx_variations_code ON variations(code);
  CREATE INDEX IF NOT EXISTS idx_menu_items_code ON menu_items(code);

END $$;
