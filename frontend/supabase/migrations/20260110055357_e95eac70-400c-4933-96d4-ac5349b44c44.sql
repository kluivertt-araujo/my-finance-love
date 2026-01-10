-- Add account_id column to goal_contributions table
ALTER TABLE public.goal_contributions
ADD COLUMN account_id uuid REFERENCES public.accounts(id);

-- Create index for better query performance
CREATE INDEX idx_goal_contributions_account_id ON public.goal_contributions(account_id);