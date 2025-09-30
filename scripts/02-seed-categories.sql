-- Seed default categories based on existing products

INSERT INTO categories (name, slug, prompt_instructions) VALUES
  ('RUNNING SHOES', 'running-shoes', 'Generate a professional product photo showing the running shoes being worn by a model in an athletic setting. Focus on the shoe design and comfort.'),
  ('ACCESSORIES', 'accessories', 'Generate a lifestyle photo showing the accessory being worn casually. Keep the focus on the product while showing it in use.'),
  ('MEN''S PANTS', 'mens-pants', 'Generate a full-body photo showing the pants being worn by a male model. Show the fit and style clearly.'),
  ('MEN''S HOODIE', 'mens-hoodie', 'Generate a photo showing the hoodie being worn by a male model. Capture the comfort and style of the garment.')
ON CONFLICT (slug) DO NOTHING;
