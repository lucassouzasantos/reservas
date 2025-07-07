/*
  # Schema update for room reservation system

  1. New Tables
    - `salas` (rooms)
      - `id` (integer, primary key, auto-increment)
      - `nome` (text, room name)
      - `capacidade` (integer, capacity)
      - `ubicacion` (text, location)
      - `equipamento` (text[], equipment array)
      - `ativo` (boolean, active status, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reservas` (reservations)
      - `id` (uuid, primary key)
      - `sala_id` (integer, foreign key to salas)
      - `fecha` (timestamptz, reservation date)
      - `hora_inicio` (time, start time)
      - `hora_fin` (time, end time)
      - `nome` (varchar, requester name)
      - `correo` (varchar, email)
      - `asistentes` (integer, number of attendees)
      - `descripcion` (text, description)
      - `estado` (varchar, status, default 'pendiente')
      - `user_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `profiles` (user profiles)
      - `id` (uuid, primary key, foreign key to users)
      - `email` (text, unique)
      - `full_name` (text, user's full name)
      - `role` (text, user role, default 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for full access
    - Add function to check admin role

  3. Functions
    - `update_updated_at_column()` - trigger function for updating timestamps
    - `handle_new_user()` - function to create profile when user signs up
    - `is_admin()` - function to check if user is admin

  4. Triggers
    - Auto-update `updated_at` columns
    - Auto-create profile on user signup
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create salas table
CREATE TABLE IF NOT EXISTS salas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    capacidade INTEGER NOT NULL,
    ubicacion VARCHAR(100),
    equipamento TEXT[] DEFAULT ARRAY[]::text[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reservas table
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sala_id INTEGER REFERENCES salas(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    nome VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    asistentes INTEGER NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view salas" ON salas;
DROP POLICY IF EXISTS "Admins can manage salas" ON salas;
DROP POLICY IF EXISTS "Users can view own reservas" ON reservas;
DROP POLICY IF EXISTS "Users can create reservas" ON reservas;
DROP POLICY IF EXISTS "Users can update own reservas" ON reservas;
DROP POLICY IF EXISTS "Users can delete own reservas" ON reservas;
DROP POLICY IF EXISTS "Admins can manage all reservas" ON reservas;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Policies for salas
CREATE POLICY "Anyone can view salas"
    ON salas
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage salas"
    ON salas
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Policies for reservas
CREATE POLICY "Users can view own reservas"
    ON reservas
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create reservas"
    ON reservas
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reservas"
    ON reservas
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reservas"
    ON reservas
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reservas"
    ON reservas
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Policies for profiles
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

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_salas_updated_at ON salas;
CREATE TRIGGER update_salas_updated_at
    BEFORE UPDATE ON salas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservas_updated_at ON reservas;
CREATE TRIGGER update_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Insert sample salas data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Sala del consejo') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('Sala del consejo', 10, 'Oficina Central', ARRAY['Proyector', 'Pizarra', 'WiFi']);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Auditorio') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('Auditorio', 100, '2 Piso ECOP', ARRAY['Sistema de sonido', 'Proyector', 'Micrófono', 'WiFi']);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Sala Insumos') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('Sala Insumos', 20, 'Insumos Central', ARRAY['Proyector', 'WiFi']);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Amambay') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('Amambay', 10, 'Insumos Amambay', ARRAY['Pizarra', 'WiFi']);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'San Juan nepomuceno') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('San Juan nepomuceno', 12, 'Oficina San Juan Nepomuceno', ARRAY['Proyector', 'WiFi']);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM salas WHERE nome = 'Sala Piso 3') THEN
        INSERT INTO salas (nome, capacidade, ubicacion, equipamento) 
        VALUES ('Sala Piso 3', 8, 'Piso 3', ARRAY['Pizarra', 'WiFi']);
    END IF;
END $$;