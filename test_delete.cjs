const { createClient } = require('@supabase/supabase-js');
const url = 'https://ewoiqbhqtcdatpzhdaef.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b2lxYmhxdGNkYXRwemhkYWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNzk5MSwiZXhwIjoyMDg3NzkzOTkxfQ.7tYsh8vXStkJqhk4T-IA6rYgONJ7evPEFbbpfHR1fDc';
const adminClient = createClient(url, serviceKey);

async function run() {
    const { data: users, error } = await adminClient.auth.admin.listUsers();
    if (error) { console.error("listUsers error:", error); return; }
    console.log(users.users.map(u => ({ email: u.email, id: u.id })));
}
run();
