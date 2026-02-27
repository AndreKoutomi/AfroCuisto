const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ewoiqbhqtcdatpzhdaef.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b2lxYmhxdGNkYXRwemhkYWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNzk5MSwiZXhwIjoyMDg3NzkzOTkxfQ.7tYsh8vXStkJqhk4T-IA6rYgONJ7evPEFbbpfHR1fDc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function upload() {
    const filePath = 'd:/AfriHub/public/images/couscous_poulet.png';
    const fileBuffer = fs.readFileSync(filePath);

    console.log('Uploading image to Supabase Storage...');

    const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload('couscous_poulet.png', fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error('Upload error:', error);
    } else {
        console.log('Successfully uploaded image!', data);
        const { data: publicURLData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl('couscous_poulet.png');
        console.log('Public URL:', publicURLData.publicUrl);
    }
}

upload();
