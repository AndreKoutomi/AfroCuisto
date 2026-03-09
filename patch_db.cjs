const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'dbService.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '    // --- Dish Suggestion Fallback (Email) ---';
const endMarker = '    // Save full user profile to Supabase (user_profiles table) if available';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const newSection = `    // --- Dish Suggestion Fallback (Email) ---
    async sendDishSuggestionEmail(dish: any): Promise<{ success: boolean; error?: string }> {
        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_k3w11sm';
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_huya44j'; 
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '5bxF5hiV8eLRjESo4';

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: {
                        to_name: "André Koutomi",
                        message: \`NOUVELLE SUGGESTION : \${dish.name}\\nIngrédients: \${dish.ingredients}\\nDescription: \${dish.description}\\nPar: \${dish.submitter_name || "Anonyme"} (\${dish.submitter_email || "N/A"})\`,
                        otp_code: "NOTICE: Suggestion Recue",
                        dish_name: dish.name,
                    }
                })
            });

            if (!response.ok) {
                const text = await response.text();
                return { success: false, error: \`EmailJS Error: \${text}\` };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: \`Email Error: \${(err).message}\` };
        }
    },

    async submitDishSuggestion(dish: any): Promise<{ success: boolean; error?: string }> {
        try {
            if (!supabase) return { success: false, error: 'Supabase client not initialized' };

            const fullPayload = {
                name: dish.name.trim(),
                ingredients: dish.ingredients.trim(),
                description: dish.description.trim(),
                region: dish.region?.trim() || null,
                category: dish.category?.trim() || null,
                cooking_time: dish.cooking_time?.trim() || null,
                submitter_name: dish.submitter_name?.trim() || null,
                submitter_email: dish.submitter_email?.trim() || null,
            };

            const { error: insertError } = await supabase.from('dish_suggestions').insert([fullPayload]);

            if (insertError) {
                if (insertError.code === '42P01' || insertError.code === 'PGRST205' || insertError.message?.includes('cache')) {
                    console.warn('Table missing, using email fallback...');
                    return await this.sendDishSuggestionEmail(dish);
                }
                
                if (insertError.code === 'PGRST204' || insertError.message?.includes('column')) {
                    const minimalPayload = {
                        name: dish.name.trim(),
                        ingredients: dish.ingredients.trim(),
                        description: dish.description.trim()
                    };
                    const { error: minError } = await supabase.from('dish_suggestions').insert([minimalPayload]);
                    if (!minError) return { success: true };
                }
                return { success: false, error: insertError.message };
            }
            return { success: true };
        } catch (err) {
            console.error('Submission failed, trying last resort fallback:', err);
            return await this.sendDishSuggestionEmail(dish);
        }
    },

`;
    content = content.substring(0, startIdx) + newSection + content.substring(endIdx);
    fs.writeFileSync(filePath, content);
    console.log('File patched successfully');
} else {
    console.error('Markers not found');
    process.exit(1);
}
