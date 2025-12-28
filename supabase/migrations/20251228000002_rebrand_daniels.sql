/*
  # Update Site Settings for Daniel's Rebrand

  Updates the site_settings table to change branding from "Beracah Cafe" to "Daniel's"
*/

-- Update site name
UPDATE site_settings 
SET value = 'Daniel''s', updated_at = now() 
WHERE id = 'site_name';

-- Update site logo (using local file path)
UPDATE site_settings 
SET value = '/daniels-logo.png', updated_at = now() 
WHERE id = 'site_logo';

-- Update site description
UPDATE site_settings 
SET value = 'Home of Gourmet Pasta Salad Sandwich Coffee', updated_at = now() 
WHERE id = 'site_description';
