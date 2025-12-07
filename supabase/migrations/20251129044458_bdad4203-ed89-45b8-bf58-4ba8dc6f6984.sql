-- ============================================
-- FIX SECURITY ISSUES
-- ============================================

-- 1. Fix user_reputation public exposure - restrict to own data only
DROP POLICY IF EXISTS "Anyone can view reputation" ON public.user_reputation;

CREATE POLICY "Users can view own reputation" 
ON public.user_reputation 
FOR SELECT 
USING (auth.uid() = user_id);

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- 1. Incident Reports Table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  date_of_incident DATE,
  time_of_incident TIME,
  location TEXT,
  perpetrator_known BOOLEAN DEFAULT false,
  perpetrator_relationship TEXT,
  witnesses_present BOOLEAN DEFAULT false,
  reported_to_authorities BOOLEAN DEFAULT false,
  injuries_sustained BOOLEAN DEFAULT false,
  injury_description TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Anonymous reports can be created by anyone, users can view their own non-anonymous reports
CREATE POLICY "Anyone can create incident reports" 
ON public.incident_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own reports" 
ON public.incident_reports 
FOR SELECT 
USING (user_id = auth.uid() OR (is_anonymous = true AND user_id IS NULL));

CREATE POLICY "Admins can view all reports" 
ON public.incident_reports 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" 
ON public.incident_reports 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- 2. User Security Settings Table
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auto_logout_minutes INTEGER DEFAULT 30,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_notifications BOOLEAN DEFAULT true,
  hide_activity BOOLEAN DEFAULT false,
  browser_privacy_mode BOOLEAN DEFAULT false,
  data_encryption BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own security settings" 
ON public.user_security_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- 3. Login History Table
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_info TEXT,
  ip_address TEXT,
  location TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login history" 
ON public.login_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own login history" 
ON public.login_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- System can insert login history
CREATE POLICY "System can insert login history" 
ON public.login_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Trusted Contacts Table
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  notify_on_emergency BOOLEAN DEFAULT true,
  share_location BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own trusted contacts" 
ON public.trusted_contacts 
FOR ALL 
USING (auth.uid() = user_id);

-- 5. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  location TEXT,
  contacts_notified JSONB DEFAULT '[]',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emergency alerts" 
ON public.emergency_alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_incident_reports_updated_at
BEFORE UPDATE ON public.incident_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_security_settings_updated_at
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trusted_contacts_updated_at
BEFORE UPDATE ON public.trusted_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();