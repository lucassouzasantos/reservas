/*
  # Complete Database Schema Setup

  This migration creates the complete database schema for the room reservation system.

  ## New Tables
  1. **profiles** - User profile information
     - `id` (uuid, primary key, references auth.users)
     - `email` (text, unique, not null)
     - `full_name` (text, nullable)
     - `role` (text, default 'user', check constraint for 'admin'|'user')
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

  2. **salas** - Meeting rooms/spaces
     - `id` (integer, primary key, auto-increment)
     - `nome` (text, not null)
     - `capacidade` (integer, not null)
     - `ubicacion` (text, nullable)
     - `equipamento` (text array, default empty array)
     - `ativo` (boolean, default true)
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

  3. **reservas** - Room reservations
     - `id` (uuid, primary key, auto-generated)
     - `sala_id` (integer, foreign key to salas)
     - `user_id` (uuid, foreign key to auth.users)
     - `fecha` (timestamptz, not null)
     - `hora_inicio` (time, not null)
     - `hora_fin` (time, not null)
     - `nome` (text, not null)
     - `correo` (text, not null)
     - `asistentes` (integer, not null)
     - `descripcion` (text, nullable)
     - `estado` (text, default 'pendiente', check constraint)
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Add appropriate policies for user access control
  - Admin users can manage all data
  - Regular users can only access their own data

  ## Functions
  - `is_admin(uuid)` - Helper function to check if user is admin
  - `handle_new_user()` - Trigger function to create profile on user signup
  - `update_updated_at_column()` - Trigger function to update timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create salas table
CREATE TABLE IF NOT EXISTS salas (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  capacidade integer NOT NULL,
  ubicacion text,
  equipamento text[] DEFAULT '{}',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reservas table
CREATE TABLE IF NOT EXISTS reservas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sala_id integer REFERENCES salas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha timestamptz NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  nome text NOT NULL,
  correo text NOT NULL,
  asistentes integer NOT NULL,
  descripcion text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Salas policies
CREATE POLICY "Anyone can view salas"
  ON salas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view active salas"
  ON salas
  FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "Admins can manage salas"
  ON salas
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Reservas policies
CREATE POLICY "Users can view own reservas"
  ON reservas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservas"
  ON reservas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservas"
  ON reservas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservas"
  ON reservas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reservas"
  ON reservas
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salas_updated_at
  BEFORE UPDATE ON salas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert some sample data for testing
INSERT INTO salas (nome, capacidade, ubicacion, equipamento) VALUES
  ('Sala de Conferencias A', 20, 'Piso 1', ARRAY['Proyector', 'Pizarra', 'WiFi', 'Sistema de Audio']),
  ('Sala de Reuniones B', 8, 'Piso 2', ARRAY['TV', 'WiFi', 'Videoconferencia']),
  ('Auditorio Principal', 100, 'Planta Baja', ARRAY['Proyector', 'Sistema de Audio', 'Micrófono', 'WiFi']),
  ('Sala de Trabajo C', 6, 'Piso 1', ARRAY['Pizarra', 'WiFi'])
ON CONFLICT DO NOTHING;