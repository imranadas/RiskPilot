-- Migration 001: Add loan_breakdown column to extracted_data
-- Run this once in Supabase SQL Editor for any existing database.
-- Fresh setups (running schema.sql from scratch) already include this column.

ALTER TABLE extracted_data
  ADD COLUMN IF NOT EXISTS loan_breakdown JSONB DEFAULT NULL;
