import { sql } from 'kysely';

export const preventMultiCurrencyCart = sql`
CREATE OR REPLACE FUNCTION prevent_multi_currency_cart()
RETURNS TRIGGER AS $$
DECLARE
    existing_currency text;
BEGIN
    SELECT currency
    INTO existing_currency
    FROM cart_items
    WHERE "cartId" = NEW."cartId"
      AND id <> NEW.id
    LIMIT 1;

    IF existing_currency IS NOT NULL
       AND existing_currency <> NEW."currency" THEN
        RAISE EXCEPTION
            '[DB] Cart already contains items in %, cannot add item in %',
            existing_currency,
            NEW."currency";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER one_currency_per_cart
BEFORE INSERT OR UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION prevent_multi_currency_cart();
`;
