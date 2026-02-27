const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ewoiqbhqtcdatpzhdaef.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b2lxYmhxdGNkYXRwemhkYWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNzk5MSwiZXhwIjoyMDg3NzkzOTkxfQ.7tYsh8vXStkJqhk4T-IA6rYgONJ7evPEFbbpfHR1fDc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
    console.log('--- Syncing local data.ts to Supabase Cloud ---');
    const dataPath = path.join(__dirname, 'src', 'data.ts');
    const content = fs.readFileSync(dataPath, 'utf8');

    // Extract recipes array from data.ts
    const recipesMatch = content.match(/export const recipes: Recipe\[\] = (\[[\s\S]*?\]);/);
    if (!recipesMatch) {
        console.error('Error: Could not find recipes array in src/data.ts');
        process.exit(1);
    }

    let recipes;
    try {
        // Evaluate the string to get a real array. Note: we need to handle or mock the Recipe type if needed, 
        // but since eval doesn't care about TS types in a string, we just need the JS value.
        recipes = eval(recipesMatch[1]);
    } catch (e) {
        console.error('Error parsing recipes string:', e);
        process.exit(1);
    }

    // Deduplicate by ID
    const uniqueMap = new Map();
    recipes.forEach(r => uniqueMap.set(r.id, r));
    const uniqueRecipes = Array.from(uniqueMap.values());

    // Map to Supabase column names
    const mapped = uniqueRecipes.map(r => ({
        id: r.id,
        name: r.name,
        alias: r.alias || null,
        base: r.base || null,
        type: r.type || null,
        style: r.style || null,
        region: r.region || null,
        category: r.category || null,
        difficulty: r.difficulty || null,
        prep_time: r.prepTime || null,
        cook_time: r.cookTime || null,
        image: r.image || null,
        description: r.description || null,
        ingredients: r.ingredients || [],
        steps: r.steps || [],
        technique_title: r.techniqueTitle || null,
        technique_description: r.techniqueDescription || null,
        benefits: r.benefits || null,
        updated_at: new Date().toISOString()
    }));

    console.log(`Pushing ${mapped.length} records to 'recipes' table...`);

    const { error } = await supabase
        .from('recipes')
        .upsert(mapped, { onConflict: 'id' });

    if (error) {
        console.error('Upsert Error:', error);
        process.exit(1);
    }

    console.log('--- Cloud sync successful! ---');
}

main();
