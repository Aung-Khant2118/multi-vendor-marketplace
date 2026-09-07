CREATE TABLE IF NOT EXISTS variant_attributes (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    CONSTRAINT uq_variant_attribute UNIQUE (variant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_variant_attributes_variant_id ON variant_attributes(variant_id);
