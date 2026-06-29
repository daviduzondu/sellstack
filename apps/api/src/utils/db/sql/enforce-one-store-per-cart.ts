import { sql } from 'kysely';

export const enforceOneStorePerCart = sql`
CREATE OR REPLACE FUNCTION enforce_one_store_per_cart()
RETURNS TRIGGER AS $$
DECLARE
 existing_store_id text;
 new_store_id text;
BEGIN
    SELECT c."storeId" INTO existing_store_id
    FROM carts c
    WHERE c.id = NEW."cartId";

    SELECT p."storeId" INTO new_store_id
    FROM product_variants pv
    JOIN products p ON p.id = pv."productId"
    WHERE pv.id = NEW."variantId";


    IF new_store_id IS NULL THEN
        RAISE EXCEPTION '[DB] Invalid variant';
    END IF;

    IF existing_store_id IS NOT NULL AND existing_store_id != new_store_id THEN
        RAISE EXCEPTION '[DB] Cart items must belong to one store';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER cart_items_single_store
BEFORE INSERT OR UPDATE on cart_items
FOR EACH ROW
EXECUTE FUNCTION enforce_one_store_per_cart();
`;
