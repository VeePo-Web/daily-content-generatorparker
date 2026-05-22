-- Add parent_id column for hierarchical categories
ALTER TABLE categories 
ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Insert parent categories (Bottoms, Tees, Hats, Accessories - Hoodies already exists)
INSERT INTO categories (name, slug, description, display_order) VALUES
('Bottoms', 'bottoms', 'Premium faith-forward bottoms for every occasion', 1),
('Tees', 'tees', 'Everyday tees with purpose and meaning', 2),
('Hats', 'hats', 'Crown your style with faith-forward headwear', 4),
('Accessories', 'accessories', 'Complete your look with purposeful accessories', 5);

-- Update existing Hoodies category with proper display order
UPDATE categories SET display_order = 3, description = 'Comfortable warmth meets bold conviction' WHERE slug = 'hoodies';

-- Get parent category IDs and insert subcategories
-- Bottoms subcategories
INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Shorts', 'shorts', 'Warm weather ministry essentials', 1, id FROM categories WHERE slug = 'bottoms';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Joggers', 'joggers', 'Run your race in comfort', 2, id FROM categories WHERE slug = 'bottoms';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Sweatpants', 'sweatpants', 'Cozy faith-forward loungewear', 3, id FROM categories WHERE slug = 'bottoms';

-- Tees subcategories
INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Short Sleeve', 'short-sleeve', 'Classic everyday faith wear', 1, id FROM categories WHERE slug = 'tees';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Long Sleeve', 'long-sleeve', 'Extended coverage with purpose', 2, id FROM categories WHERE slug = 'tees';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Cropped', 'cropped', 'Bold and modern cuts', 3, id FROM categories WHERE slug = 'tees';

-- Hoodies subcategories (professional structure)
INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Pullover Hoodies', 'pullover-hoodies', 'Classic comfort essentials', 1, id FROM categories WHERE slug = 'hoodies';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Zip-Up Hoodies', 'zip-up-hoodies', 'Versatile layering pieces', 2, id FROM categories WHERE slug = 'hoodies';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Crewnecks', 'crewnecks', 'Clean sophisticated warmth', 3, id FROM categories WHERE slug = 'hoodies';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Quarter Zips', 'quarter-zips', 'Athletic heritage style', 4, id FROM categories WHERE slug = 'hoodies';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Lightweight Hoodies', 'lightweight-hoodies', 'Year-round layering essentials', 5, id FROM categories WHERE slug = 'hoodies';

-- Hats subcategories
INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Snapbacks', 'snapbacks', 'Street-ready faith headwear', 1, id FROM categories WHERE slug = 'hats';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Dad Hats', 'dad-hats', 'Relaxed casual style', 2, id FROM categories WHERE slug = 'hats';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Beanies', 'beanies', 'Cold weather faith essentials', 3, id FROM categories WHERE slug = 'hats';

-- Accessories subcategories
INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Bags', 'bags', 'Carry your faith everywhere', 1, id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Socks', 'socks', 'Grounded in truth from the foundation', 2, id FROM categories WHERE slug = 'accessories';

INSERT INTO categories (name, slug, description, display_order, parent_id)
SELECT 'Stickers', 'stickers', 'Spread the word everywhere', 3, id FROM categories WHERE slug = 'accessories';