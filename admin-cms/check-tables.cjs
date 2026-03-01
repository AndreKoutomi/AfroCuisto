const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
    const { data, error } = await supabase.from('recipes').select('id').limit(1);
    if (error) console.log("Recipes error:", error.message);
    else console.log("Recipes exists");

    const { data: sData, error: sError } = await supabase.from('home_sections').select('id').limit(1);
    if (sError) console.log("home_sections error:", sError.message);
    else console.log("home_sections exists");
}

checkTables();
