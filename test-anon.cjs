const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFetch() {
    const { data, error } = await supabase.from('recipes').select('*').order('name');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data length:", data.length);
        if (data.length > 0) {
            console.log("First item:", data[0].name);
        }
    }
}

testFetch();
