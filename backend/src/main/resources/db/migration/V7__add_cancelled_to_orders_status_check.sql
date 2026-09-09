-- Add CANCELLED back to the orders status CHECK constraint for the cancellation feature.

ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
        'DELIVERED', 'COMPLETED', 'CANCELLED'
    ));
