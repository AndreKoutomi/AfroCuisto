import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function RecipesList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [recipes, setRecipes] = useState<any[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [filterCategory, setFilterCategory] = useState('');

    async function fetchRecipes() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) {
                setRecipes(data);
                setFilteredRecipes(data);
            }
        } catch (err) {
            console.error('Error fetching recipes:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRecipes();
    }, []);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    useEffect(() => {
        let result = recipes;
        if (searchTerm) {
            result = result.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setSearchParams({ q: searchTerm }, { replace: true });
        } else {
            searchParams.delete('q');
            setSearchParams(searchParams, { replace: true });
        }

        if (filterCategory) {
            result = result.filter(r => r.category === filterCategory);
        }
        setFilteredRecipes(result);
    }, [searchTerm, filterCategory, recipes]);

    async function handleDelete(id: string) {
        if (window.confirm("Voulez-vous vraiment supprimer cette recette ?")) {
            try {
                const { error } = await supabase.from('recipes').delete().eq('id', id);
                if (error) throw error;
                const newRecipes = recipes.filter(r => r.id !== id);
                setRecipes(newRecipes);
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Erreur lors de la suppression.');
            }
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-2xl">Gestion des Recettes</h2>
                <Link to="/recipes/create" className="btn btn-primary">
                    <Plus size={18} />
                    Ajouter Nouvelle
                </Link>
            </div>

            <div className="card mb-6 p-4">
                <div className="flex gap-4">
                    <div className="form-group mb-0" style={{ flex: 1, marginBottom: 0 }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher une recette par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-0" style={{ width: '250px', marginBottom: 0 }}>
                        <select
                            className="form-control"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Toutes les catégories</option>
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
            </div>

            <div className="card">
                {loading ? (
                    <div className="center-content">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Image</th>
                                    <th>Nom</th>
                                    <th>Région</th>
                                    <th>Catégorie</th>
                                    <th>Difficulté</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecipes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                            Aucune recette trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecipes.map(recipe => (
                                        <tr key={recipe.id}>
                                            <td>
                                                {recipe.image ? (
                                                    <img
                                                        src={recipe.image}
                                                        alt={recipe.name}
                                                        className="dish-thumbnail"
                                                        style={{ objectFit: 'cover', display: 'block', backgroundColor: '#f1f5f9' }}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.parentElement) {
                                                                const fallback = document.createElement('div');
                                                                fallback.className = 'dish-thumbnail flex items-center justify-center text-muted';
                                                                fallback.style.fontSize = '10px';
                                                                fallback.innerText = 'N/A';
                                                                e.currentTarget.parentElement.appendChild(fallback);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="dish-thumbnail flex items-center justify-center text-muted" style={{ fontSize: '10px' }}>N/A</div>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{recipe.name}</td>
                                            <td className="text-muted">{recipe.region || '—'}</td>
                                            <td>
                                                <span className="badge">{recipe.category || '—'}</span>
                                            </td>
                                            <td className="text-muted">{recipe.difficulty || '—'}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link to={`/recipes/edit/${recipe.id}`} className="btn-icon">
                                                        <Edit2 size={18} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(recipe.id)} className="btn-icon text-danger">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
