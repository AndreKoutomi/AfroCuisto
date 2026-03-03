require('dotenv').config();
const https = require('https');

const apiKey = process.env.OPENAI_API_KEY;
const model = "openai/gpt-4o";

if (!apiKey) {
    console.error("Erreur: La clé API OpenAI est manquante. Assurez-vous d'avoir un fichier .env à la racine du projet (D:/AfriHub/) avec OPENAI_API_KEY=\"VOTRE_CLÉ\"");
    process.exit(1);
}

console.log("Clé API chargée (premiers caractères) :", apiKey.substring(0, 5) + "..."); // Affiche les 5 premiers caractères pour vérifier le chargement

const data = JSON.stringify({
    model: model,
    messages: [{ role: "user", content: "Say hello" }]
});

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
