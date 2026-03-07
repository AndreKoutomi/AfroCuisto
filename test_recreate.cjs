const { createClient } = require('@supabase/supabase-js');
const url = 'https://ewoiqbhqtcdatpzhdaef.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b2lxYmhxdGNkYXRwemhkYWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNzk5MSwiZXhwIjoyMDg3NzkzOTkxfQ.7tYsh8vXStkJqhk4T-IA6rYgONJ7evPEFbbpfHR1fDc';
const adminClient = createClient(url, serviceKey);

async function run() {
    // 1. Create a user
    const email = "testdelete123@example.com";
    console.log("Creating user", email);
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: email,
        password: "password123",
        email_confirm: true
    });
    if (createError) {
        console.error("Create error:", createError);
        return;
    }
    const userId = createData.user.id;
    console.log("User created with ID:", userId);

    // 2. Delete the user
    console.log("Deleting user", userId);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
        console.error("Delete error:", deleteError);
        return;
    }
    console.log("User deleted successfully");

    // 3. Re-create the same user
    console.log("Recreating user", email);
    const { data: recreateData, error: recreateError } = await adminClient.auth.admin.createUser({
        email: email,
        password: "password123",
        email_confirm: true
    });
    if (recreateError) {
        console.error("Recreate error:", recreateError);
        return;
    }
    console.log("Recreate success, new ID:", recreateData.user.id);

    // cleanup
    await adminClient.auth.admin.deleteUser(recreateData.user.id);
}
run();
