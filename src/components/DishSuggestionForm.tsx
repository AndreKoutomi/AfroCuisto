import React, { useMemo, useState } from 'react';

export interface DishSuggestionPayload {
    name: string;
    ingredients: string;
    description: string;
    region?: string;
    category?: string;
    cooking_time?: string;
    submitter_name?: string;
    submitter_email?: string;
}

interface DishSuggestionFormProps {
    onSubmit: (dish: DishSuggestionPayload) => Promise<boolean> | boolean;
}

const inputClassName = "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-[#fb5607] focus:ring-4 focus:ring-[#fb5607]/10";
const labelClassName = "mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-stone-400";

const DishSuggestionForm: React.FC<DishSuggestionFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<DishSuggestionPayload>({
        name: '',
        ingredients: '',
        description: '',
        region: '',
        category: '',
        cooking_time: '',
        submitter_name: '',
        submitter_email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = useMemo(() => {
        return Boolean(
            formData.name.trim() &&
            formData.ingredients.trim() &&
            formData.description.trim()
        );
    }, [formData]);

    const handleChange = (field: keyof DishSuggestionPayload, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await onSubmit({
                name: formData.name.trim(),
                ingredients: formData.ingredients.trim(),
                description: formData.description.trim(),
                region: formData.region?.trim() || undefined,
                category: formData.category?.trim() || undefined,
                cooking_time: formData.cooking_time?.trim() || undefined,
                submitter_name: formData.submitter_name?.trim() || undefined,
                submitter_email: formData.submitter_email?.trim() || undefined,
            });

            if (success) {
                setFormData({
                    name: '',
                    ingredients: '',
                    description: '',
                    region: '',
                    category: '',
                    cooking_time: '',
                    submitter_name: '',
                    submitter_email: '',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="dish-name" className={labelClassName}>Nom du plat</label>
                <input
                    id="dish-name"
                    type="text"
                    className={inputClassName}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Amiwo au poulet fumé"
                    required
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="dish-region" className={labelClassName}>Région / origine</label>
                    <input
                        id="dish-region"
                        type="text"
                        className={inputClassName}
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        placeholder="Ex: Mono, Ouémé, diaspora..."
                    />
                </div>
                <div>
                    <label htmlFor="dish-category" className={labelClassName}>Catégorie</label>
                    <input
                        id="dish-category"
                        type="text"
                        className={inputClassName}
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        placeholder="Ex: Sauce, grillade, boisson..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="dish-submit-name" className={labelClassName}>Votre nom</label>
                    <input
                        id="dish-submit-name"
                        type="text"
                        className={inputClassName}
                        value={formData.submitter_name}
                        onChange={(e) => handleChange('submitter_name', e.target.value)}
                        placeholder="Ex: André Koutomi"
                    />
                </div>
                <div>
                    <label htmlFor="dish-submit-email" className={labelClassName}>Votre email</label>
                    <input
                        id="dish-submit-email"
                        type="email"
                        className={inputClassName}
                        value={formData.submitter_email}
                        onChange={(e) => handleChange('submitter_email', e.target.value)}
                        placeholder="Ex: nom@email.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="dish-cooking-time" className={labelClassName}>Temps estimé</label>
                <input
                    id="dish-cooking-time"
                    type="text"
                    className={inputClassName}
                    value={formData.cooking_time}
                    onChange={(e) => handleChange('cooking_time', e.target.value)}
                    placeholder="Ex: 45 min"
                />
            </div>

            <div>
                <label htmlFor="dish-ingredients" className={labelClassName}>Ingrédients principaux</label>
                <textarea
                    id="dish-ingredients"
                    className={`${inputClassName} min-h-[110px] resize-none`}
                    value={formData.ingredients}
                    onChange={(e) => handleChange('ingredients', e.target.value)}
                    placeholder="Listez les ingrédients clés du plat"
                    required
                />
            </div>

            <div>
                <label htmlFor="dish-description" className={labelClassName}>Description / méthode</label>
                <textarea
                    id="dish-description"
                    className={`${inputClassName} min-h-[140px] resize-none`}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Décrivez le plat, sa préparation ou son histoire"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full rounded-full bg-[#fb5607] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#fb5607]/20 transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
            >
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre la suggestion'}
            </button>
        </form>
    );
};

export default DishSuggestionForm;
