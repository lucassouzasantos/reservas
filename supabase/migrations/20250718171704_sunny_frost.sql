/*
  # Add Requested Rooms

  1. New Rooms
    - Sala del Consejo
    - Auditorio ECOP  
    - Departamento Técnico Central
    - Sala Amambay
    - Sala San Juan Nepomuceno
    - Sala Libre

  2. Features
    - Each room has appropriate capacity and location
    - All rooms are active by default
    - Proper naming and descriptions
*/

-- Insert the requested rooms
INSERT INTO salas (nome, capacidade, ubicacion, ativo) VALUES
  ('Sala del Consejo', 12, 'Oficina Central', true),
  ('Auditorio ECOP', 100, '2do Piso ECOP', true),
  ('Departamento Técnico Central', 15, 'Oficina Central', true),
  ('Sala Amambay', 8, 'Sucursal Amambay', true),
  ('Sala San Juan Nepomuceno', 10, 'Sucursal San Juan Nepomuceno', true),
  ('Sala Libre', 6, 'Oficina Central', true)
ON CONFLICT (nome) DO NOTHING;