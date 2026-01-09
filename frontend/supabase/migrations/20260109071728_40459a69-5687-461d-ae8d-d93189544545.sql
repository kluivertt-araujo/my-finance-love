-- Criar enum para tipos de conta
CREATE TYPE public.account_type AS ENUM ('checking', 'savings', 'wallet', 'credit_card');

-- Criar enum para tipos de transação
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Criar enum para recorrência
CREATE TYPE public.recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'pt' CHECK (language IN ('pt', 'en')),
  currency TEXT DEFAULT 'BRL',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6366f1',
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de contas bancárias
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  initial_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de transações (receitas e despesas)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  recurrence recurrence_type DEFAULT 'none',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de transferências
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de metas financeiras
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para categories
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para accounts
CREATE POLICY "Users can view own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para transfers
CREATE POLICY "Users can view own transfers" ON public.transfers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transfers" ON public.transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transfers" ON public.transfers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transfers" ON public.transfers
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para financial_goals
CREATE POLICY "Users can view own goals" ON public.financial_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.financial_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil ao registrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar saldo da conta após transação
CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSE
      UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSE
      UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter transação antiga
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSE
      UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
    -- Aplicar nova transação
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSE
      UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance_on_transaction();

-- Função para atualizar saldos após transferência
CREATE OR REPLACE FUNCTION public.update_account_balance_on_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.from_account_id;
    UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.from_account_id;
    UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter transferência antiga
    UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.from_account_id;
    UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;
    -- Aplicar nova transferência
    UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.from_account_id;
    UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transfer_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance_on_transfer();