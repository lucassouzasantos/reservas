/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profiles with roles
    - `salas` - Meeting rooms with capacity and location
    - `reservas` - Room reservations with status tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin functions for role checking

  3. Sample Data
    - Insert the requested meeting rooms
    - Set up initial admin user capabilities

  4. Functions and Triggers
    - Auto-create profiles on user signup
    - Update timestamps automatically
    - Admin role checking function
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- Salas policies
CREATE POLICY "Anyone can view salas" ON salas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anyone can view active salas" ON salas
  FOR SELECT TO authenticated
  USING (ativo = true);

CREATE POLICY "Admins can manage salas" ON salas
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Reservas policies
CREATE POLICY "Users can view own reservas" ON reservas
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservas" ON reservas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservas" ON reservas
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservas" ON reservas
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reservas" ON reservas
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salas_updated_at ON salas;
CREATE TRIGGER update_salas_updated_at
  BEFORE UPDATE ON salas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservas_updated_at ON reservas;
CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample salas
INSERT INTO salas (nome, capacidade, ubicacion) VALUES
  ('Sala del Consejo', 12, 'Oficina Central'),
  ('Auditorio ECOP', 100, '2do Piso ECOP'),
  ('Departamento Técnico Central', 15, 'Oficina Central'),
  ('Sala Amambay', 8, 'Sucursal Amambay'),
  ('Sala San Juan Nepomuceno', 10, 'Sucursal San Juan Nepomuceno'),
  ('Sala Libre', 6, 'Oficina Central')
ON CONFLICT DO NOTHING;