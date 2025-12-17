-- Migration: Add Scanner Enhancements
-- Date: 2025-01-XX
-- Phase 1: Email Scanner Enhancements

-- Add recipient_email to email_scans table
ALTER TABLE email_scans ADD COLUMN IF NOT EXISTS recipient_email VARCHAR;

-- Add last_scan_at to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN email_scans.recipient_email IS 'Email address from the To header';
COMMENT ON COLUMN users.last_scan_at IS 'Timestamp of last inbox scan for this user';
