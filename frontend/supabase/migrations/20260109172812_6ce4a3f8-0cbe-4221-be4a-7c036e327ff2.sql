-- Add currency column to transactions table with default from user's preference
ALTER TABLE public.transactions 
ADD COLUMN currency text NOT NULL DEFAULT 'BRL';

-- Add currency column to transfers table with default from user's preference
ALTER TABLE public.transfers 
ADD COLUMN currency text NOT NULL DEFAULT 'BRL';

-- Add comment to explain the currency column
COMMENT ON COLUMN public.transactions.currency IS 'Currency code (BRL, USD, CAD, EUR, GBP)';
COMMENT ON COLUMN public.transfers.currency IS 'Currency code (BRL, USD, CAD, EUR, GBP)';