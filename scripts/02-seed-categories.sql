-- Seed default categories based on existing products

INSERT INTO categories (name, slug, prompt_instructions) VALUES
  ('APPAREL', 'apparel', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('ACCESSORIES', 'accessories', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('STATIONERY', 'stationery', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.'),
  ('OTHER', 'other', 'Create a lifestyle product photo showing a person wearing {{product_name}}. The setting should be casual and natural. Keep the focus on the accessory while showing it being used in everyday life. Use soft, natural lighting.')
ON CONFLICT (slug) DO NOTHING;
