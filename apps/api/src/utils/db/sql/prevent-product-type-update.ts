import { sql } from 'kysely';

export const preventProductTypeUpdate = sql`
CREATE OR REPLACE FUNCTION prevent_product_type_update()
RETURNS TRIGGER AS $$
BEGIN 
    IF NEW.type <> OLD.type THEN
        RAISE EXCEPTION '[DB] Product type cannot be changed after creation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER block_product_type_update
BEFORE UPDATE OF type ON products
FOR EACH ROW
EXECUTE FUNCTION prevent_product_type_update();
`;
