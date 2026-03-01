import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Trash2, Calendar, Utensils } from 'lucide-react';

interface Review {
    id: string;
    recipe_id: string;
    recipe_name: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export function Feedback() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        try {
            setLoading(true);
            // On tente de récupérer les données. Si la table n'existe pas, Supabase renverra une erreur que l'on gérera.
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // Si l'erreur est liée à une table inexistante (code 42P01 en postgres)
                if (error.code === '42P01') {
                    console.warn("La table 'reviews' n'existe pas encore.");
                    setReviews([]);
                    return;
                }
                throw error;
            }
            setReviews(data || []);
        } catch (err) {
            console.error('Erreur lors de la récupération des retours:', err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteReview(id: string) {
        if (!confirm('Voulez-vous vraiment supprimer ce retour client ?')) return;
        try {
            const { error } = await supabase.from('reviews').delete().eq('id', id);
            if (error) throw error;
            setReviews(reviews.filter(r => r.id !== id));
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    }

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="font-medium">Chargement des retours clients...</p>
        </div>
    );

    const stats = {
        total: reviews.length,
        average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0,
        withComment: reviews.filter(r => r.comment).length
    };

    return (
        <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Retours</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-800">{stats.total}</span>
                        <span className="text-gray-400 text-sm mb-1 font-bold">avis</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Note Moyenne</p>
                    <div className="flex items-end gap-2 text-amber-500">
                        <span className="text-4xl font-black">{stats.average}</span>
                        <Star className="mb-2 fill-amber-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Commentaires</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-blue-500">{stats.withComment}</span>
                        <span className="text-gray-400 text-sm mb-1 font-bold">écrit(s)</span>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-full p-20 text-center bg-white rounded-[40px] shadow-sm border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun retour pour le moment</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Les avis laissés par les utilisateurs depuis l'application mobile apparaîtront ici en temps réel.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-1.5 p-1 px-3 bg-amber-50 rounded-full border border-amber-100">
                                    <span className="text-sm font-black text-amber-600 mr-1">{review.rating}</span>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'} />
                                    ))}
                                </div>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                    title="Supprimer l'avis"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex-1 mb-6">
                                <blockquote className="text-gray-700 font-medium leading-relaxed">
                                    {review.comment ? `"${review.comment}"` : <span className="text-gray-300 italic">Aucun commentaire laissé</span>}
                                </blockquote>
                            </div>

                            <div className="mt-auto pt-5 border-t border-gray-50 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <Utensils size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Plat concerné</span>
                                        <span className="text-[13px] font-bold text-gray-800 leading-none">{review.recipe_name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">
                                            {review.user_name.charAt(0)}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500">{review.user_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                        <Calendar size={12} />
                                        <span>{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
