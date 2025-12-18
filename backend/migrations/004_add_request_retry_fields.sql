ALTER TABLE deletion_requests
    ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;
