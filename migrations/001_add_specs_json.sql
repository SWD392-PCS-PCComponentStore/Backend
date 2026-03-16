-- Migration: Add specs_json column to PRODUCT table
-- Purpose: Store structured, type-safe specifications in JSON format
-- Date: 2026-03-15

USE PCComponentStore;
GO

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PRODUCT' AND COLUMN_NAME = 'specs_json'
)
BEGIN
    ALTER TABLE PRODUCT ADD specs_json NVARCHAR(MAX);
    PRINT 'Added specs_json column to PRODUCT table';
END
ELSE
BEGIN
    PRINT 'specs_json column already exists';
END
GO

-- Update products with sample JSON specs (optional - for demo)
-- This will be done separately with actual categorized data
