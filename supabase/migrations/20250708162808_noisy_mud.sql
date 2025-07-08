/*
  # Remove equipment functionality from salas table

  1. Schema Changes
    - Remove equipamento column from salas table
  
  2. Update sample data
    - Remove equipment references from existing data
*/

-- Remove equipamento column from salas table
ALTER TABLE salas DROP COLUMN IF EXISTS equipamento;

-- Update existing sample data to remove equipment references
-- (This is handled automatically when the column is dropped)