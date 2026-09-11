import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { AlertTriangle, ShieldAlert, Trash2, Ban, Store, Package, Mail, MessageSquare, Check, X } from 'lucide-react';

export default function ModerationModal({
    isOpen,
    onClose,
    onConfirm,
    type = 'product', // 'product' | 'store' | 'user'
    itemName = '',
    targetInfo = null, // Extra details like seller email or phone
    isLoading = false,
}) {
    const [reason, setReason] = useState('');
    const [storeAction, setStoreAction] = useState('suspend'); // 'suspend' | 'delete'
    const [error, setError] = useState('');

    // Predefined reason suggestions based on moderation type
    const reasonSuggestions = {
        product: [
            'Produit contrefait ou copie non autorisée',
            'Description mensongère ou photos non conformes',
            'Article illicite, dangereux ou prohibé',
            'Non-respect de la politique de prix ou arnaque',
            'Plaintes répétées de clients non honorées',
        ],
        store: [
            'Non-respect des conditions générales d\'utilisation (CGU)',
            'Suspicion de fraude ou signalements d\'arnaques clients',
            'Contenu de boutique inadapté ou non conforme',
            'Vitrine inactive avec commandes non traitées',
        ],
        user: [
            'Violation grave et répétée des règles de la plateforme',
            'Activité frauduleuse avérée ou litiges de paiement',
            'Plaintes multiples de clients avec non-livraison',
            'Usurpation d\'identité ou faux documents',
        ],
    };

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setStoreAction('suspend');
            setError('');
        }
    }, [isOpen]);

    const handleSelectSuggestion = (suggestion) => {
        setReason((prev) => {
            if (!prev) return suggestion;
            return `${prev}. ${suggestion}`;
        });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = reason.trim();
        if (!trimmed || trimmed.length < 5) {
            setError('Veuillez préciser un motif clair d\'au moins 5 caractères (requis pour l\'email/WhatsApp du vendeur).');
            return;
        }

        onConfirm({
            reason: trimmed,
            action: type === 'store' ? storeAction : undefined,
        });
    };

    // Dynamic config according to type
    const config = {
        product: {
            title: 'Suppression Modérée de Produit',
            icon: Trash2,
            iconBg: 'bg-rose-100 text-rose-600',
            buttonText: 'Supprimer le produit & Notifier',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            warning: 'Le produit sera définitivement retiré du catalogue de la boutique.',
        },
        store: {
            title: storeAction === 'delete' ? 'Suppression Définitive de la Vitrine' : 'Suspension de la Vitrine Vendeur',
            icon: Store,
            iconBg: storeAction === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700',
            buttonText: storeAction === 'delete' ? 'Supprimer la vitrine & Notifier' : 'Suspendre la vitrine & Notifier',
            buttonColor: storeAction === 'delete' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white',
            warning: storeAction === 'delete' 
                ? 'La vitrine et ses données seront supprimées de la plateforme.' 
                : 'La vitrine sera immédiatement masquée du public et passée en brouillon.',
        },
        user: {
            title: 'Bannissement du Compte Vendeur',
            icon: Ban,
            iconBg: 'bg-rose-100 text-rose-600',
            buttonText: 'Bannir le compte & Notifier',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            warning: 'Le vendeur ne pourra plus se connecter et sa vitrine sera immédiatement dépubliée.',
        },
    }[type] || {
        title: 'Action de Modération',
        icon: AlertTriangle,
        iconBg: 'bg-amber-100 text-amber-700',
        buttonText: 'Confirmer la décision',
        buttonColor: 'bg-slate-950 text-white',
        warning: 'Une notification sera envoyée.',
    };

    const Icon = config.icon;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="lg">
            <div className="p-6 sm:p-7 space-y-6 font-sans">
                {/* HEADER */}
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 pr-6 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-950">
                                {config.title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Élément concerné : <strong className="text-slate-900 font-bold">{itemName}</strong>
                            {targetInfo && <span className="block text-slate-400 mt-0.5">{targetInfo}</span>}
                        </p>
                    </div>
                </div>

                {/* STORE SPECIFIC ACTION SELECTOR */}
                {type === 'store' && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Type d'action de modération :
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setStoreAction('suspend')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                                    storeAction === 'suspend'
                                        ? 'bg-amber-50 border-amber-400 text-amber-950'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div>
                                    <div className="text-xs">Suspendre</div>
                                    <div className="text-[10px] text-slate-500 font-normal">Dépublier / Brouillon</div>
                                </div>
                                {storeAction === 'suspend' && <Check className="w-4 h-4 text-amber-600" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStoreAction('delete')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                                    storeAction === 'delete'
                                        ? 'bg-rose-50 border-rose-400 text-rose-950'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div>
                                    <div className="text-xs">Supprimer</div>
                                    <div className="text-[10px] text-slate-500 font-normal">Suppression totale</div>
                                </div>
                                {storeAction === 'delete' && <Check className="w-4 h-4 text-rose-600" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* REASON INPUT */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Motif officiel communiqué au vendeur</span>
                                <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Requis pour l'avis</span>
                        </div>

                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Expliquez clairement au vendeur la raison de cette décision de modération..."
                            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none transition"
                        />

                        {error && (
                            <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> {error}
                            </p>
                        )}
                    </div>

                    {/* SUGGESTION CHIPS */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Suggestions de motifs rapides :
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {(reasonSuggestions[type] || []).map((sug, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(sug)}
                                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer text-left"
                                >
                                    + {sug}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DUAL NOTIFICATION CALLOUT */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-[11px] leading-relaxed">
                            <strong className="text-slate-950 font-bold">Notification automatique multicanale :</strong>
                            <p className="text-slate-600">
                                Dès validation, le vendeur recevra un <strong>Email officiel</strong> ainsi qu'un message <strong>WhatsApp</strong> détaillant le motif exact saisi ci-dessus.
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS BUTTONS */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-2 ${config.buttonColor}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Traitement...
                                </span>
                            ) : (
                                config.buttonText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
