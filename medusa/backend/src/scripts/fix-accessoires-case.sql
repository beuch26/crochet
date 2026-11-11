-- Folders on disk use ORIGINAL uppercase groupId (A0000GMZE/) but import
-- script lowercased groupIds in DB URLs → all accessoires images 404.
-- Walk every unique folder slug and UPPER-case its occurrences.

DO $$
DECLARE
  folder_slug TEXT;
BEGIN
  FOR folder_slug IN
    SELECT DISTINCT (regexp_matches(thumbnail, '/accessoires/([a-z0-9]+)/'))[1]
    FROM product
    WHERE thumbnail LIKE '%/accessoires/%' AND deleted_at IS NULL
  LOOP
    UPDATE product
    SET thumbnail = REPLACE(thumbnail, '/accessoires/' || folder_slug || '/', '/accessoires/' || UPPER(folder_slug) || '/')
    WHERE thumbnail LIKE '%/accessoires/' || folder_slug || '/%';

    UPDATE image
    SET url = REPLACE(url, '/accessoires/' || folder_slug || '/', '/accessoires/' || UPPER(folder_slug) || '/')
    WHERE url LIKE '%/accessoires/' || folder_slug || '/%';

    UPDATE product_variant
    SET metadata = REPLACE(metadata::text, '/accessoires/' || folder_slug || '/', '/accessoires/' || UPPER(folder_slug) || '/')::jsonb
    WHERE metadata::text LIKE '%/accessoires/' || folder_slug || '/%';
  END LOOP;
END $$;

SELECT 'accessoires image paths uppercased' AS status;
