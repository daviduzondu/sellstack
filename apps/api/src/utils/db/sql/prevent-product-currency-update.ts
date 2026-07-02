import { sql } from 'kysely';

export const preventProductCurrencyUpdate = sql`
CREATE OR REPLACE FUNCTION prevent_product_currency_update()
RETURNS TRIGGER AS $$
BEGIN 
    IF NEW.currency <> OLD.currency THEN
        RAISE EXCEPTION '[DB] Product currency cannot be changed after creation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER block_product_currency_update
BEFORE UPDATE OF currency ON products
FOR EACH ROW
EXECUTE FUNCTION prevent_product_currency_update();
`;
