-- Re-apply orders status CHECK constraint with CANCELLED included.
-- This is a safety net in case V7 did not apply correctly.

DO $$
BEGIN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

    ALTER TABLE orders
        ADD CONSTRAINT orders_status_check
        CHECK (status IN (
            'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
            'DELIVERED', 'COMPLETED', 'CANCELLED'
        ));
END $$;
