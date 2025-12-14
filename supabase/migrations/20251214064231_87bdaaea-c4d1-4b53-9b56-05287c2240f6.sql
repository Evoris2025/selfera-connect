-- Update the reaction_type enum from support/informative/relatable to heart/hug
-- First, we need to handle existing data and update the enum

-- Step 1: Create the new enum type
CREATE TYPE reaction_type_new AS ENUM ('heart', 'hug');

-- Step 2: Migrate existing reactions data
-- Map: support -> heart, informative -> hug, relatable -> heart
ALTER TABLE reactions 
  ALTER COLUMN type TYPE reaction_type_new 
  USING (
    CASE type::text
      WHEN 'support' THEN 'heart'::reaction_type_new
      WHEN 'informative' THEN 'hug'::reaction_type_new
      WHEN 'relatable' THEN 'heart'::reaction_type_new
    END
  );

-- Step 3: Drop old enum and rename new one
DROP TYPE reaction_type;
ALTER TYPE reaction_type_new RENAME TO reaction_type;