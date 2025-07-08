/*
  # Fix database issues and ensure proper schema

  1. Schema Updates
    - Ensure all required tables exist with correct structure
    - Remove equipamento column if it exists
    - Add missing columns if needed

  2. Security
    - Ensure RLS is properly configured
    - Fix any missing policies

  3. Data
    - Ensure sample data exists
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

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create salas table WITHOUT equipamento column
CREATE TABLE IF NOT EXISTS salas (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    ubicacion TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Remove equipamento column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salas' AND column_name = 'equipamento'
    ) THEN
        ALTER TABLE salas DROP COLUMN equipamento;
    END IF;
END $$;

-- Create reservas table
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sala_id INTEGER REFERENCES salas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    nome TEXT NOT NULL,
    correo TEXT NOT NULL,
    asistentes INTEGER NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view salas" ON salas;
DROP POLICY IF EXISTS "Anyone can view active salas" ON salas;
DROP POLICY IF EXISTS "Admins can manage salas" ON salas;

DROP POLICY IF EXISTS "Users can view own reservas" ON reservas;
DROP POLICY IF EXISTS "Users can create reservas" ON reservas;
DROP POLICY IF EXISTS "Users can update own reservas" ON reservas;
DROP POLICY IF EXISTS "Users can delete own reservas" ON reservas;
DROP POLICY IF EXISTS "Admins can manage all reservas" ON reservas;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()));

-- Policies for salas
CREATE POLICY "Anyone can view salas"
    ON salas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can view active salas"
    ON salas FOR SELECT
    TO authenticated
    USING (ativo = true);

CREATE POLICY "Admins can manage salas"
    ON salas FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Policies for reservas
CREATE POLICY "Users can view own reservas"
    ON reservas FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create reservas"
    ON reservas FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reservas"
    ON reservas FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reservas"
    ON reservas FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reservas"
    ON reservas FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Insert sample salas data (without equipamento)
INSERT INTO salas (nome, capacidade, ubicacion) VALUES
    ('Sala del consejo', 10, 'Oficina Central'),
    ('Auditorio', 100, '2 Piso ECOP'),
    ('Sala Insumos', 20, 'Insumos Central'),
    ('Amambay', 10, 'Insumos Amambay'),
    ('San Juan nepomuceno', 12, 'Oficina San Juan Nepomuceno'),
    ('Sala Piso 3', 8, 'Piso 3')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for salas
SELECT setval('salas_id_seq', (SELECT COALESCE(MAX(id), 0) FROM salas));