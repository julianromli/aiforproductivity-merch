-- Seed default AI prompts for each product category
-- These prompts will be used when generating personalized product images

-- Get product IDs and insert default prompts
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN 
    SELECT id, name, category FROM products
  LOOP
    INSERT INTO ai_prompts (product_id, prompt_template, is_default)
    VALUES (
      product_record.id,
      CASE product_record.category
        WHEN 'RUNNING SHOES' THEN 
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'ACCESSORIES' THEN
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'MEN''S PANTS' THEN
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'MEN''S HOODIE' THEN
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        ELSE
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
      END,
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
