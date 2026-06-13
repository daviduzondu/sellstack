import { sql } from 'kysely';

export const setUpdatedAt = sql`
-- Create or replace function for updating the updatedAt column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;  -- Ensure to return the modified row
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for all tables in the public schema
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname = 'public'
      AND EXISTS (
          SELECT 1
          FROM information_schema.columns c
          WHERE c.table_schema = 'public'
            AND c.table_name = t.tablename
            AND c.column_name = 'updatedAt'
      )
    LOOP
        -- Create or replace the trigger for each table
        EXECUTE format('
            CREATE OR REPLACE TRIGGER update_updated_at
            BEFORE INSERT OR UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
        ', tbl);
    END LOOP;
END $$;`;
