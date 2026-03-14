-- ============================================================
-- SCRIPT SUPABASE : Table des Notifications Push
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Création de la table push_notifications
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT DEFAULT '🔔',
    color TEXT DEFAULT '#F94D00',
    link_type TEXT DEFAULT 'general', -- 'recipe', 'section', 'general'
    link_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    read_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour trier par date rapidement
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_at ON public.push_notifications (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notifications_active ON public.push_notifications (is_active);

-- Activer Row Level Security (RLS)
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique (l'app peut lire toutes les notifs actives)
CREATE POLICY "Allow public read active notifications" ON public.push_notifications
    FOR SELECT USING (is_active = TRUE);

-- Politique : écriture admin uniquement (via service_role_key)
CREATE POLICY "Allow service role full access" ON public.push_notifications
    USING (TRUE)
    WITH CHECK (TRUE);

-- Activer Realtime pour cette table (pour les mises à jour instantanées)
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notifications;

-- Insérer une notification de test
INSERT INTO public.push_notifications (title, body, icon, color, link_type)
VALUES (
    'Bienvenue sur AfroCuisto ! 🎉',
    'Explorez des centaines de recettes africaines authentiques. Bonne découverte !',
    '🎉',
    '#F94D00',
    'general'
);
