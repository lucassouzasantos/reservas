/*
  # Admin System Setup

  1. New Tables
    - `profiles` - User profiles with roles
  2. Schema Updates
    - Add `user_id` column to existing `reservas` table
  3. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Add admin-specific policies
  4. Functions & Triggers
    - Auto-create user profiles
    - Update timestamps
    - Admin role checking
*/

-- Criar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar user_id à tabela reservas existente se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reservas ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar created_at e updated_at às tabelas existentes se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salas' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE salas ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salas' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE salas ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reservas ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservas ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
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

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Políticas para salas
DROP POLICY IF EXISTS "Anyone can view salas" ON salas;
CREATE POLICY "Anyone can view salas"
  ON salas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage salas" ON salas;
CREATE POLICY "Admins can manage salas"
  ON salas FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Políticas para reservas
DROP POLICY IF EXISTS "Users can view own reservas" ON reservas;
CREATE POLICY "Users can view own reservas"
  ON reservas FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reservas" ON reservas;
CREATE POLICY "Users can create reservas"
  ON reservas FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own reservas" ON reservas;
CREATE POLICY "Users can update own reservas"
  ON reservas FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own reservas" ON reservas;
CREATE POLICY "Users can delete own reservas"
  ON reservas FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all reservas" ON reservas;
CREATE POLICY "Admins can manage all reservas"
  ON reservas FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));