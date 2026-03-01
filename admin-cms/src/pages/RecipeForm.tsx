import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const INITIAL_STATE = {
    name: '',
    alias: '',
    region: '',
    category: '',
    difficulty: 'Moyen',
    prep_time: '',
    cook_time: '',
    image: '',
    description: '',
    technique_title: '',
    technique_description: '',
    benefits: '',
    style: '',
    type: '',
    base: '',
    origine_humaine: ''
};

export function RecipeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);

    useEffect(() => {
        if (id) {
            async function fetchRecipe() {
                const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
                if (data && !error) {
                    setFormData({
                        ...INITIAL_STATE,
                        ...data
                    });
                }
                setInitialLoading(false);
            }
            fetchRecipe();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploading(true);

            const { error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('recipe-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image: data.publicUrl }));
        } catch (error) {
            console.error('Error uploading image: ', error);
            alert('Erreur lors du téléchargement de l\'image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanData = { ...formData };
        if ('origine_humaine' in cleanData) {
            delete (cleanData as any).origine_humaine;
        }

        try {
            if (id) {
                const { error } = await supabase.from('recipes').update(cleanData).eq('id', id);
                if (error) throw error;
            } else {
                (cleanData as any).id = `rec_${Date.now()}`;
                const { error } = await supabase.from('recipes').insert([cleanData]);
                if (error) throw error;
            }
            navigate('/recipes');
        } catch (err) {
            console.error('Save error:', err);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="center-content"><div className="loader"></div></div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/recipes" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Retour
                </Link>
                <h2 className="font-bold text-2xl">
                    {id ? 'Modifier la Recette' : 'Ajouter une Recette'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-3 grid-gap-4">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h3 className="card-title">Informations Générales</h3>
                    </div>
                    <div className="p-6">
                        <div className="form-group">
                            <label className="form-label">Nom de la recette</label>
                            <input required name="name" value={formData.name || ''} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="grid grid-cols-2 grid-gap-4">
                            <div className="form-group">
                                <label className="form-label">Alias (Optionnel)</label>
                                <input name="alias" value={formData.alias || ''} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Catégorie</label>
                                <select name="category" value={formData.category || ''} onChange={handleChange} className="form-control">
                                    <option value="">Sélectionner...</option>
                                    <option value="Pâtes et Céréales (Wɔ̌)">Pâtes et Céréales</option>
                                    <option value="Sauces (Nùsúnnú)">Sauces</option>
                                    <option value="Plats de Résistance & Ragoûts">Plats de Résistance</option>
                                    <option value="Protéines & Grillades">Protéines & Grillades</option>
                                    <option value="Street Food & Snacks (Amuse-bouche)">Street Food</option>
                                    <option value="Boissons & Douceurs">Boissons</option>
                                    <option value="Condiments & Accompagnements">Condiments</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 grid-gap-4">
                            <div className="form-group">
                                <label className="form-label">Type de Plat</label>
                                <input name="type" value={formData.type || ''} onChange={handleChange} className="form-control" placeholder="ex: Plat Principal, Dessert..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Style de Cuisine</label>
                                <input name="style" value={formData.style || ''} onChange={handleChange} className="form-control" placeholder="ex: Braisé, Vapeur..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 grid-gap-4">
                            <div className="form-group">
                                <label className="form-label">Base Principale</label>
                                <input name="base" value={formData.base || ''} onChange={handleChange} className="form-control" placeholder="ex: Maïs, Manioc, Poulet..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Origine (Peuple/Humaine)</label>
                                <input name="origine_humaine" value={formData.origine_humaine || ''} onChange={handleChange} className="form-control" placeholder="ex: Fon, Mina, Yoruba..." />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description Courte / Introduction</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="form-control" rows={4} />
                        </div>

                        <div className="grid grid-cols-2 grid-gap-4">
                            <div className="form-group">
                                <label className="form-label">Technique - Titre</label>
                                <input name="technique_title" value={formData.technique_title || ''} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bienfaits de la recette</label>
                                <input name="benefits" value={formData.benefits || ''} onChange={handleChange} className="form-control" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Technique - Description</label>
                            <textarea name="technique_description" value={formData.technique_description || ''} onChange={handleChange} className="form-control" rows={3} />
                        </div>
                    </div>
                </div>

                <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Détails & Publication</h3>
                        </div>
                        <div className="p-6">
                            <div className="form-group">
                                <label className="form-label">Image du plat</label>
                                {formData.image ? (
                                    <div style={{ position: 'relative', minHeight: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                                        <img
                                            src={formData.image}
                                            alt="Aperçu"
                                            className="dish-thumbnail-lg"
                                            style={{ margin: 0, border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <span className="text-muted text-sm" style={{ zIndex: 0 }}>Image en cours de chargement / Introuvable</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="btn btn-secondary text-sm"
                                            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, backgroundColor: 'white' }}>
                                            Changer
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-area flex flex-col items-center justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                        {uploading ? (
                                            <div className="flex items-center gap-2 text-muted">
                                                <div className="loader" style={{ width: 16, height: 16 }}></div>
                                                Téléchargement...
                                            </div>
                                        ) : (
                                            <div className="text-muted">
                                                <p className="font-medium text-main mb-1">Cliquez pour ajouter une image</p>
                                                <p className="text-sm">JPG, PNG, GIF jusqu'à 5MB</p>
                                            </div>
                                        )}
                                    </label>
                                )}
                                <div className="mt-2">
                                    <label className="form-label text-sm text-muted">Ou coller une URL d'image :</label>
                                    <input name="image" value={formData.image || ''} onChange={handleChange} className="form-control text-sm" placeholder="https://" />
                                </div>
                            </div>
                            <div className="form-group mt-4">
                                <label className="form-label">Région / Origine</label>
                                <input name="region" value={formData.region || ''} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Difficulté</label>
                                <select name="difficulty" value={formData.difficulty || ''} onChange={handleChange} className="form-control">
                                    <option value="Très Facile">Très Facile</option>
                                    <option value="Facile">Facile</option>
                                    <option value="Intermédiaire">Intermédiaire</option>
                                    <option value="Moyen">Moyen</option>
                                    <option value="Difficile">Difficile</option>
                                    <option value="Très Difficile">Très Difficile</option>
                                    <option value="Extrême">Extrême</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 grid-gap-4 mt-4">
                                <div className="form-group">
                                    <label className="form-label">Temps Prép.</label>
                                    <input name="prep_time" value={formData.prep_time || ''} onChange={handleChange} className="form-control" placeholder="ex: 15 min" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Temps Cuisson</label>
                                    <input name="cook_time" value={formData.cook_time || ''} onChange={handleChange} className="form-control" placeholder="ex: 45 min" />
                                </div>
                            </div>

                            <div className="form-group mt-4">
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                                    {loading ? <div className="loader" style={{ width: 16, height: 16 }}></div> : <><Save size={18} /> Enregistrer</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
