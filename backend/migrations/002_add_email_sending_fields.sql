-- Migration: Add Email Sending Fields
-- Date: 2025-01-XX
-- Phase 2: Automated Email Sending

-- Add Gmail tracking fields to deletion_requests table
ALTER TABLE deletion_requests ADD COLUMN IF NOT EXISTS gmail_sent_message_id VARCHAR;
ALTER TABLE deletion_requests ADD COLUMN IF NOT EXISTS gmail_thread_id VARCHAR;

-- Add error tracking fields
ALTER TABLE deletion_requests ADD COLUMN IF NOT EXISTS last_send_error TEXT;
ALTER TABLE deletion_requests ADD COLUMN IF NOT EXISTS send_attempts INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deletion_requests_gmail_sent_message_id ON deletion_requests(gmail_sent_message_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_gmail_thread_id ON deletion_requests(gmail_thread_id);

-- Add comments for documentation
COMMENT ON COLUMN deletion_requests.gmail_sent_message_id IS 'Gmail message ID of sent deletion request email';
COMMENT ON COLUMN deletion_requests.gmail_thread_id IS 'Gmail thread ID for tracking responses';
COMMENT ON COLUMN deletion_requests.last_send_error IS 'Last error encountered when trying to send';
COMMENT ON COLUMN deletion_requests.send_attempts IS 'Number of send attempts made';
