import { useState, useEffect } from 'react';
import { Save, Key, Globe, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [model, setModel] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setApiKey(localStorage.getItem('gemini_api_key') || '');
        setBaseUrl(localStorage.getItem('ai_base_url') || '');
        setModel(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('ai_base_url', baseUrl);
        localStorage.setItem('gemini_model', model);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const cardStyle: React.CSSProperties = {
        background: '#fff',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0',
        maxWidth: '800px',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 18px',
        borderRadius: '14px',
        border: '1.5px solid #e5e7eb',
        fontSize: '14px',
        fontWeight: 500,
        outline: 'none',
        transition: 'all 0.2s',
        marginBottom: '20px',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: 800,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#fff5f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Key size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Configuration de l'IA</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Gérez vos clés API et modèles pour la génération automatique</p>
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}><Key size={12} style={{ marginRight: '4px' }} /> Clé API (Gemini ou OpenAI)</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}><Globe size={12} style={{ marginRight: '4px' }} /> Base URL (Optionnel pour OpenAI)</label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://api.openai.com/v1"
                            style={inputStyle}
                        />
                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '-15px' }}>
                            Laissez vide pour utiliser les endpoints par défaut.
                        </p>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={labelStyle}><Layers size={12} style={{ marginRight: '4px' }} /> Modèle compatible</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            <optgroup label="Google Gemini">
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Rapide)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Puissant)</option>
                            </optgroup>
                            <optgroup label="OpenAI">
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o mini</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </optgroup>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                            type="submit"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '14px 30px', borderRadius: '14px',
                                background: 'var(--primary)', color: '#fff',
                                border: 'none', fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(251, 86, 7, 0.2)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Save size={18} /> Enregistrer les réglages
                        </button>

                        {saved && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                                <CheckCircle2 size={18} /> Configuration enregistrée !
                            </div>
                        )}
                    </div>
                </form>

                <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '18px', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <AlertCircle size={16} color="#6b7280" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Note technique</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.6 }}>
                        Les données sont stockées localement dans votre navigateur. Si vous utilisez un modèle OpenAI,
                        assurez-vous que votre clé commence par <code>sk-</code>. Pour Gemini, le système utilisera
                        automatiquement l'endpoint <code>v1beta</code> pour supporter le mode JSON.
                    </p>
                </div>
            </div>
        </div>
    );
}
