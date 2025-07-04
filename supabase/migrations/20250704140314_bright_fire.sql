/*
  # Sistema de Administração - Migração Completa

  1. Novas Tabelas
    - `profiles` - Perfis de usuários com roles (admin/user)
    - `salas` - Salas de reunião (migração dos dados existentes)
    - `reservas` - Reservas (migração dos dados existentes)

  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas para admins e usuários normais
    - Função para verificar se usuário é admin

  3. Dados Iniciais
    - Inserir salas existentes
    - Configurar usuário admin padrão
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

-- Tabela de salas (migração da estrutura existente)
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

-- Tabela de reservas (migração da estrutura existente)
CREATE TABLE IF NOT EXISTS reservas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Políticas para salas
CREATE POLICY "Anyone can view active salas"
  ON salas FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "Admins can manage salas"
  ON salas FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Políticas para reservas
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

-- Inserir salas existentes
INSERT INTO salas (id, nome, capacidade, ubicacion, equipamento) VALUES
(1, 'Sala del consejo', 10, 'Oficina Central', '{}'),
(2, 'Auditorio', 100, '2 Piso ECOP', '{}'),
(3, 'Sala Insumos', 20, 'Insumos Central', '{}'),
(4, 'Amambay', 10, 'Insumos Amambay', '{}'),
(5, 'San Juan nepomuceno', 12, 'Oficina San Juan Nepomuceno', '{}'),
(6, 'Sala Piso 3', 8, 'Piso 3', '{}')
ON CONFLICT (id) DO NOTHING;

-- Resetar sequência para salas
SELECT setval('salas_id_seq', (SELECT MAX(id) FROM salas));