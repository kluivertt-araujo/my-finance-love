-- Add description and status fields to financial_goals
ALTER TABLE public.financial_goals 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'));

-- Update is_completed based on status
UPDATE public.financial_goals SET status = 'completed' WHERE is_completed = true;
UPDATE public.financial_goals SET status = 'active' WHERE is_completed = false OR is_completed IS NULL;

-- Create goal_contributions table for tracking deposits
CREATE TABLE IF NOT EXISTS public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goal_contributions
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_contributions
CREATE POLICY "Users can view their own goal contributions" 
ON public.goal_contributions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal contributions" 
ON public.goal_contributions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal contributions" 
ON public.goal_contributions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal contributions" 
ON public.goal_contributions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on goal_contributions
CREATE TRIGGER update_goal_contributions_updated_at
BEFORE UPDATE ON public.goal_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user_id ON public.goal_contributions(user_id);