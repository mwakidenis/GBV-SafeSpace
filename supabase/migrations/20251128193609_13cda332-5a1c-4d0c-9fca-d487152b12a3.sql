-- Create user_settings table for persisting user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  forum_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  anonymous_by_default BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT false,
  allow_messages BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create safety_plans table for support portal
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  safe_places JSONB DEFAULT '[]'::jsonb,
  warning_signs TEXT,
  coping_strategies TEXT,
  support_network JSONB DEFAULT '[]'::jsonb,
  important_documents TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own safety plans" ON public.safety_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_safety_plans_updated_at
  BEFORE UPDATE ON public.safety_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create ai_chat_history table
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat history" ON public.ai_chat_history
  FOR ALL USING (auth.uid() = user_id);

-- Enable leaked password protection
-- Note: This requires auth configuration update