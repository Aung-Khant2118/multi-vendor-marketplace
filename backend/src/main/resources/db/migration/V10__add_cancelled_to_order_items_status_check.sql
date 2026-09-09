-- Add CANCELLED to order_items status CHECK constraint for the cancellation feature.

ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS order_items_status_check;

ALTER TABLE order_items
    ADD CONSTRAINT order_items_status_check
    CHECK (status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
        'DELIVERED', 'COMPLETED', 'CANCELLED'
    ));
