const { createClient } = require('@supabase/supabase-js');
const url = 'https://ewoiqbhqtcdatpzhdaef.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b2lxYmhxdGNkYXRwemhkYWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNzk5MSwiZXhwIjoyMDg3NzkzOTkxfQ.7tYsh8vXStkJqhk4T-IA6rYgONJ7evPEFbbpfHR1fDc';
const adminClient = createClient(url, serviceKey);

// normal client requires anon key
const anonKey = import.meta.env ? '' : process.env.VITE_SUPABASE_ANON_KEY;
// Let's just use service key for normal client too for the test, or extract anon key from .env.
