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
          'Create a professional product photography image showing a person wearing {{product_name}}. The person should be in an athletic pose, showcasing the running shoes prominently. Use natural lighting and a clean background. Focus on the shoe design, comfort, and performance features.'
        WHEN 'ACCESSORIES' THEN
          'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'
        WHEN 'MEN''S PANTS' THEN
          'Create a full-body fashion photo showing a male model wearing {{product_name}}. Show the fit, style, and fabric texture clearly. Use professional studio lighting with a neutral background. The model should be in a confident, casual pose.'
        WHEN 'MEN''S HOODIE' THEN
          'Create a fashion product photo showing a male model wearing {{product_name}}. Capture the comfort, style, and quality of the hoodie. Use natural lighting with an urban or casual background. The model should look relaxed and confident.'
        ELSE
          'Create a professional product photo showing a person wearing or using {{product_name}}. Use natural lighting and showcase the product clearly.'
      END,
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
