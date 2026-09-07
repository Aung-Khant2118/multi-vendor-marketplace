-- The orders table has a stale CHECK constraint that was created before
-- the PROCESSING status was added to the Java enum.  Hibernate's
-- ddl-auto=update never modifies existing constraints, so we must fix it
-- manually.

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
        'DELIVERED', 'COMPLETED', 'CANCELED', 'REFUNDED'
    ));
