-- Fix payments status CHECK constraint to include all PaymentStatus values.

ALTER TABLE payments
    DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments
    ADD CONSTRAINT payments_status_check
    CHECK (status IN (
        'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
    ));
