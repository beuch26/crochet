-- Passe les prix de centimes en euros. A LANCER UNE SEULE FOIS, base sauvegardee.
--
-- Les prix etaient stockes en centimes alors que Medusa v2 attend des euros : le
-- module Stripe multipliait encore par 100 et demandait 2 999 EUR pour 29,99 EUR.
--
-- Le garde-fou arrete tout si la base est deja convertie. Un second passage
-- diviserait encore les prix par 100, sans erreur.
BEGIN;
DO $$
DECLARE plus_haut numeric; avec_decimales int; commandes int;
BEGIN
  SELECT max(amount) INTO plus_haut FROM price WHERE deleted_at IS NULL;
  SELECT count(*) INTO avec_decimales FROM price WHERE deleted_at IS NULL AND amount % 1 <> 0;
  SELECT count(*) INTO commandes FROM "order";
  IF plus_haut < 1000 OR avec_decimales > 0 THEN
    RAISE EXCEPTION 'Base deja convertie ? plus haut prix %, % prix avec decimales', plus_haut, avec_decimales;
  END IF;
  IF commandes > 0 THEN
    RAISE EXCEPTION '% commandes en base : leurs montants ne sont pas traites par ce script', commandes;
  END IF;
END $$;

UPDATE price
SET amount = round(amount / 100, 2),
    raw_amount = jsonb_build_object('value', trim_scale(round(amount / 100, 2))::text, 'precision', 20);

-- Seuil de la livraison gratuite (regle sur item_total), en euros lui aussi.
UPDATE shipping_option_rule SET value = '"50"'::jsonb
WHERE attribute = 'item_total' AND value = '"5000"'::jsonb AND deleted_at IS NULL;

-- Paniers ouverts dans les navigateurs : meme unite que les prix.
UPDATE cart_line_item
SET unit_price = round(unit_price / 100, 2),
    raw_unit_price = jsonb_build_object('value', trim_scale(round(unit_price / 100, 2))::text, 'precision', 20)
WHERE cart_id IN (SELECT id FROM cart WHERE completed_at IS NULL);

UPDATE cart_shipping_method
SET amount = round(amount / 100, 2),
    raw_amount = jsonb_build_object('value', trim_scale(round(amount / 100, 2))::text, 'precision', 20)
WHERE cart_id IN (SELECT id FROM cart WHERE completed_at IS NULL);

-- Les anciennes collections portent les montants x100 : le tunnel en recreera.
UPDATE cart_payment_collection SET deleted_at = now() WHERE deleted_at IS NULL;
COMMIT;
