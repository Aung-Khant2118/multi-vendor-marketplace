-- Remove CANCELED and REFUNDED from the orders status CHECK constraint.
-- The order flow is now strictly: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED -> COMPLETED

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
        'DELIVERED', 'COMPLETED'
    ));
