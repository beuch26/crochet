-- Set sensible default filters for every collection that has none.
-- price+brand+Couleur is the safe universal combo; baby categories with
-- clothing-like sizing get Taille too.

UPDATE product_collection
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', '["price","brand","Couleur"]')
WHERE deleted_at IS NULL
  AND handle IN (
    'biberons-tetines', 'vaisselle-bebe', 'trousse-de-soin-bebe',
    'bola-de-grossesse', 'tresse-de-lit-bebe',
    'bout-de-sein', 'attache-tetine',
    'coquillage-allaitement-nacre', 'coussinet-allaitement',
    'soins-allaitement', 'soins-grossesse',
    'conservation-lait-maternel', 'tire-lait',
    'soutien-gorge-allaitement'
  )
  AND (metadata->>'filters' IS NULL OR metadata->>'filters' = '');

-- Parent/umbrella collections: price + brand only (no variants)
UPDATE product_collection
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', '["price","brand"]')
WHERE deleted_at IS NULL
  AND handle IN ('bebe', 'pour-maman', 'bijoux')
  AND (metadata->>'filters' IS NULL OR metadata->>'filters' = '');

-- Bout de sein: size matters (S/M/L)
UPDATE product_collection
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', '["price","brand","Taille"]')
WHERE deleted_at IS NULL AND handle = 'bout-de-sein';

-- Soutien-gorge: both color + size
UPDATE product_collection
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', '["price","brand","Couleur","Taille"]')
WHERE deleted_at IS NULL AND handle = 'soutien-gorge-allaitement';

SELECT handle, metadata->>'filters' AS filters
FROM product_collection
WHERE deleted_at IS NULL
ORDER BY handle;
