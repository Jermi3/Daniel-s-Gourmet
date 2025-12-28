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
/*
  # Seed Menu Items with Codes

  1. New Data
    - Inserts new categories first to satisfy foreign key constraints.
    - Inserts new menu items for categories:
      - SUB SANDWICH
      - PANINI SANDWICH
      - Salad bowls
      - Salad Wrap
      - PASTA
      - BREAKFAST EGG PITA
      - PIZZA PITA
    - Each item includes variations with specific prices and codes.
*/

DO $$
DECLARE
  v_category text;
  v_item_id uuid;
BEGIN
  -- 1. Insert Categories First
  -- Categories needed: SUB SANDWICH, PANINI SANDWICH, Salad bowls, Salad Wrap, PASTA, BREAKFAST EGG PITA, PIZZA PITA
  -- IDs should be kebab-case or similar. I will use the capitalized name as ID if that's what the previous INSERT blocked on,
  -- BUT the schema says `id text PRIMARY KEY`. The error said `Key (category)=(SUB SANDWICH) is not present`.
  -- This implies the `category` column in `menu_items` holds the ID of the category.
  -- So I should insert categories with ID='SUB SANDWICH' etc, or change the menu_items insert to use a slug.
  -- Looking at the error: `Key (category)=(SUB SANDWICH)`.
  -- So I will insert the categories with these exact IDs to be safe and match the previous attempt, 
  -- or clearer slugs and update the inserts.
  -- Let's use the provided names as IDs (or slugs) for simplicity and matching the user's "Code" logic if any.
  -- Actually, standard practice for `id` is kebab-case (e.g., 'hot-coffee').
  -- However, the user's data provided "SUB SANDWICH" as the category header.
  -- If I use 'sub-sandwich' as ID, I must use 'sub-sandwich' in the `menu_items(category)` column.
  -- I will use kebab-case for IDs and update the insert references.

  -- Helper function to slugify (just manual here)
  
  -- SUB SANDWICH
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('sub-sandwich', 'Sub Sandwich', '🥪', 10, true)
  ON CONFLICT (id) DO NOTHING;

  -- PANINI SANDWICH
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('panini-sandwich', 'Panini Sandwich', '🥪', 11, true)
  ON CONFLICT (id) DO NOTHING;

  -- Salad bowls
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('salad-bowls', 'Salad Bowls', '🥗', 12, true)
  ON CONFLICT (id) DO NOTHING;

  -- Salad Wrap
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('salad-wrap', 'Salad Wrap', '🌯', 13, true)
  ON CONFLICT (id) DO NOTHING;

  -- PASTA
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('pasta', 'Pasta', '🍝', 14, true)
  ON CONFLICT (id) DO NOTHING;

  -- BREAKFAST EGG PITA
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('breakfast-egg-pita', 'Breakfast Egg Pita', '🍳', 15, true)
  ON CONFLICT (id) DO NOTHING;

  -- PIZZA PITA
  INSERT INTO categories (id, name, icon, sort_order, active)
  VALUES ('pizza-pita', 'Pizza Pita', '🍕', 16, true)
  ON CONFLICT (id) DO NOTHING;


  -- 2. Insert Menu Items (using the new Category IDs)

  -- Category: SUB SANDWICH
  v_category := 'sub-sandwich';

  -- Ham Stack: FULL: 210 (B1F), SOLO: 170 (B1S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Ham Stack', 'Ham Stack', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B1F'),
  (v_item_id, 'SOLO', 170, 'B1S');

  -- Chicken Salad Sub: FULL: 210 (B2F), SOLO: 170 (B2S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Chicken Salad Sub', 'Chicken Salad Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B2F'),
  (v_item_id, 'SOLO', 170, 'B2S');

  -- Grilled chix Pesto Sub: FULL: 210 (B3F), SOLO: 170 (B3S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled chix Pesto Sub', 'Grilled chix Pesto Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B3F'),
  (v_item_id, 'SOLO', 170, 'B3S');

  -- Club Sub: FULL: 210 (B4F), SOLO: 170 (B4S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Club Sub', 'Club Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B4F'),
  (v_item_id, 'SOLO', 170, 'B4S');

  -- Tuna Salad Sub: FULL: 210 (B5F), SOLO: 170 (B5S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Tuna Salad Sub', 'Tuna Salad Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B5F'),
  (v_item_id, 'SOLO', 170, 'B5S');

  -- Banh Mi Sub: FULL: 210 (B6F), SOLO: 170 (B6S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Banh Mi Sub', 'Banh Mi Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B6F'),
  (v_item_id, 'SOLO', 170, 'B6S');

  -- Kani Sub: FULL: 210 (B7F), SOLO: 170 (B7S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Kani Sub', 'Kani Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B7F'),
  (v_item_id, 'SOLO', 170, 'B7S');

  -- Sausage & Spinach Sub: FULL: 210 (B8F), SOLO: 170 (B8S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Sausage & Spinach Sub', 'Sausage & Spinach Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B8F'),
  (v_item_id, 'SOLO', 170, 'B8S');

  -- Spanish Sardines Sub: FULL: 210 (B9F), SOLO: 170 (B9S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Spanish Sardines Sub', 'Spanish Sardines Sub', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'B9F'),
  (v_item_id, 'SOLO', 170, 'B9S');

  -- Philly Cheese Steak Sub: FULL: 300 (B10F)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Philly Cheese Steak Sub', 'Philly Cheese Steak Sub', 300, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 300, 'B10F');

  -- Smoked Salmon Sub: FULL: 300 (B11F)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Smoked Salmon Sub', 'Smoked Salmon Sub', 300, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 300, 'B11F');


  -- Category: PANINI SANDWICH
  v_category := 'panini-sandwich';

  -- Grilled chicken Pesto: FULL: 195 (N1F), SOLO: 160 (N1S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled chicken Pesto', 'Grilled chicken Pesto', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N1F'),
  (v_item_id, 'SOLO', 160, 'N1S');

  -- 3 Cheese Deluxe: FULL: 195 (N2F), SOLO: 160 (N2S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('3 Cheese Deluxe', '3 Cheese Deluxe', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N2F'),
  (v_item_id, 'SOLO', 160, 'N2S');

  -- Cheesy Pepperoni: FULL: 195 (N???F -> N3F), SOLO: 160 (N3S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Cheesy Pepperoni', 'Cheesy Pepperoni', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N3F'),
  (v_item_id, 'SOLO', 160, 'N3S');

  -- Ham and Cheese: FULL: 195 (N4F), SOLO: 160 (N4S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Ham and Cheese', 'Ham and Cheese', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N4F'),
  (v_item_id, 'SOLO', 160, 'N4S');

  -- Spanish Sardines: FULL: 195 (N5F), SOLO: 160 (N5S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Spanish Sardines', 'Spanish Sardines', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N5F'),
  (v_item_id, 'SOLO', 160, 'N5S');

  -- Bacon & Mushroom Melt: FULL: 195 (N6F), SOLO: 160 (N6S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Bacon & Mushroom Melt', 'Bacon & Mushroom Melt', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N6F'),
  (v_item_id, 'SOLO', 160, 'N6S');

  -- Grilled Veggie: FULL: 195 (N7F), SOLO: 160 (N7S)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled Veggie', 'Grilled Veggie', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N7F'),
  (v_item_id, 'SOLO', 160, 'N7S');

  -- Sausage & Spinach: FULL: 195 (N8F), SOLO: 160 (N9S -> keeping N9S as requested)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Sausage & Spinach', 'Sausage & Spinach', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'N8F'),
  (v_item_id, 'SOLO', 160, 'N9S');


  -- Category: Salad bowls
  v_category := 'salad-bowls';

  -- Greek Grilled Chicken Salad: S1F/S1S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Greek Grilled Chicken Salad', 'Greek Grilled Chicken Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S1F'),
  (v_item_id, 'SOLO', 160, 'S1S');

  -- Chicken Kani-Apple Salad: S2F/S2S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Chicken Kani-Apple Salad', 'Chicken Kani-Apple Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S2F'),
  (v_item_id, 'SOLO', 160, 'S2S');

  -- Japanese Kani-Mango Salad: S3F/S3S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Japanese Kani-Mango Salad', 'Japanese Kani-Mango Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S3F'),
  (v_item_id, 'SOLO', 160, 'S3S');

  -- Pesto Pasta Salad: S4F/S4S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Pesto Pasta Salad', 'Pesto Pasta Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S4F'),
  (v_item_id, 'SOLO', 160, 'S4S');

  -- Mexican Beef Taco Salad: S5F/S5S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mexican Beef Taco Salad', 'Mexican Beef Taco Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S5F'),
  (v_item_id, 'SOLO', 160, 'S5S');

  -- Tuna-Cranberry Salad: S6F/S6S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Tuna-Cranberry Salad', 'Tuna-Cranberry Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S6F'),
  (v_item_id, 'SOLO', 160, 'S6S');

  -- Grilled Veggie Salad: S7F/S7S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled Veggie Salad', 'Grilled Veggie Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S7F'),
  (v_item_id, 'SOLO', 160, 'S7S');

  -- Mexican Pasta Salad: S8F/S8S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mexican Pasta Salad', 'Mexican Pasta Salad', 195, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 195, 'S8F'),
  (v_item_id, 'SOLO', 160, 'S8S');


  -- Category: Salad Wrap
  v_category := 'salad-wrap';

  -- Greek Grilled Chicken Salad: W1F/W1S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Greek Grilled Chicken Salad', 'Greek Grilled Chicken Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W1F'),
  (v_item_id, 'SOLO', 170, 'W1S');

  -- Chicken Kani-Apple Salad: W2F/W2S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Chicken Kani-Apple Salad', 'Chicken Kani-Apple Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W2F'),
  (v_item_id, 'SOLO', 170, 'W2S');

  -- Japanese Kani-Mango Salad: W3F/W3S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Japanese Kani-Mango Salad', 'Japanese Kani-Mango Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W3F'),
  (v_item_id, 'SOLO', 170, 'W3S');

  -- Pesto Pasta Salad: W4F/W4S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Pesto Pasta Salad', 'Pesto Pasta Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W4F'),
  (v_item_id, 'SOLO', 170, 'W4S');

  -- Mexican Beef Taco Salad: W5F/W5S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mexican Beef Taco Salad', 'Mexican Beef Taco Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W5F'),
  (v_item_id, 'SOLO', 170, 'W5S');

  -- Tuna-Cranberry Salad: W6F/W6S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Tuna-Cranberry Salad', 'Tuna-Cranberry Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W6F'),
  (v_item_id, 'SOLO', 170, 'W6S');

  -- Grilled Veggie Salad: W7F/W7S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled Veggie Salad', 'Grilled Veggie Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W7F'),
  (v_item_id, 'SOLO', 170, 'W7S');

  -- Mexican Pasta Salad: W8F/W9S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mexican Pasta Salad', 'Mexican Pasta Salad (Wrap)', 230, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 230, 'W8F'),
  (v_item_id, 'SOLO', 170, 'W9S');


  -- Category: PASTA
  v_category := 'pasta';

  -- Aglio Olio Pasta: P1F/P1S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Aglio Olio Pasta', 'Aglio Olio Pasta', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P1F'),
  (v_item_id, 'SOLO', 195, 'P1S');

  -- Grilled chicken Pesto: P2F/P2S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Grilled chicken Pesto', 'Grilled chicken Pesto (Pasta)', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P2F'),
  (v_item_id, 'SOLO', 195, 'P2S');

  -- Marinara Pepperoni: P3F/P3S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Marinara Pepperoni', 'Marinara Pepperoni', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P3F'),
  (v_item_id, 'SOLO', 195, 'P3S');

  -- Spanish Sardines Pasta: P4F/P4S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Spanish Sardines Pasta', 'Spanish Sardines Pasta', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P4F'),
  (v_item_id, 'SOLO', 195, 'P4S');

  -- Classic Bacon Carbonara: P5F/P5S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Classic Bacon Carbonara', 'Classic Bacon Carbonara', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P5F'),
  (v_item_id, 'SOLO', 195, 'P5S');

  -- 3Cheese Deluxe: P6F/P6S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('3Cheese Deluxe', '3Cheese Deluxe (Pasta)', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P6F'),
  (v_item_id, 'SOLO', 195, 'P6S');

  -- Mushroom Truffle: P7F/P7S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mushroom Truffle', 'Mushroom Truffle', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P7F'),
  (v_item_id, 'SOLO', 195, 'P7S');

  -- Beef Mexican Melt: P8F/P8S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Beef Mexican Melt', 'Beef Mexican Melt', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P8F'),
  (v_item_id, 'SOLO', 195, 'P8S');

  -- Sausage and Spinach: P9F/P9S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Sausage and Spinach', 'Sausage and Spinach (Pasta)', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P9F'),
  (v_item_id, 'SOLO', 195, 'P9S');

  -- Creamy Pesto pasta: P10F/P10S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Creamy Pesto pasta', 'Creamy Pesto pasta', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P10F'),
  (v_item_id, 'SOLO', 195, 'P10S');

  -- Charlie Chan Pasta: P11F/P11S
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Charlie Chan Pasta', 'Charlie Chan Pasta', 210, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'FULL', 210, 'P11F'),
  (v_item_id, 'SOLO', 195, 'P11S');


  -- Category: BREAKFAST EGG PITA
  v_category := 'breakfast-egg-pita';

  -- Ham&Corn: SOLO: 160 (E1)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Ham&Corn', 'Ham&Corn', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E1');

  -- Bacon& Caramelized Onion: SOLO: 160 (E2)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Bacon& Caramelized Onion', 'Bacon& Caramelized Onion', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E2');

  -- Creamy Spinach: SOLO: 160 (E3)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Creamy Spinach', 'Creamy Spinach', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E3');

  -- Mushroom & Caramelized Onion: SOLO: 160 (E4)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Mushroom & Caramelized Onion', 'Mushroom & Caramelized Onion', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E4');

  -- Sausage & Sundried Tomato: SOLO: 160 (E5)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Sausage & Sundried Tomato', 'Sausage & Sundried Tomato', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E5');

  -- Kani & Corn: SOLO: 160 (E6)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Kani & Corn', 'Kani & Corn', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'E6');


  -- Category: PIZZA PITA
  v_category := 'pizza-pita';

  -- Ham & Cheese Pizza: SOLO: 160 (Z1)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Ham & Cheese Pizza', 'Ham & Cheese Pizza', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'Z1');

  -- Pepperoni & Cheese: SOLO: 160 (Z2)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Pepperoni & Cheese', 'Pepperoni & Cheese', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'Z2');

  -- Garlic Spinach Creamcheese Pizza: SOLO: 160 (Z3)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Garlic Spinach Creamcheese Pizza', 'Garlic Spinach Creamcheese Pizza', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'Z3');

  -- 3 Cheese Pizza: SOLO: 160 (Z4)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('3 Cheese Pizza', '3 Cheese Pizza', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'Z4');

  -- Vegetarian: SOLO: 160 (Z5)
  INSERT INTO menu_items (name, description, base_price, category)
  VALUES ('Vegetarian', 'Vegetarian', 160, v_category)
  RETURNING id INTO v_item_id;

  INSERT INTO variations (menu_item_id, name, price, code) VALUES
  (v_item_id, 'SOLO', 160, 'Z5');

END $$;
