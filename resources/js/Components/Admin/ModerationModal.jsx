import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Trash2, Ban, Store, Check } from 'lucide-react';
import { Button, SubPage, fieldClass, labelClass } from '@/Components/Dashboard/UI';

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
            title: 'Supprimer le produit',
            icon: Trash2,
            iconBg: 'bg-red-50 text-[#B91C1C]',
            buttonText: 'Supprimer et notifier',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            warning: 'Le produit sera définitivement retiré du catalogue de la boutique.',
        },
        store: {
            title: 'Modérer la vitrine',
            icon: Store,
            iconBg: storeAction === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-[#FFF3C4] text-[#7A5B00]',
            buttonText: storeAction === 'delete' ? 'Supprimer et notifier' : 'Suspendre et notifier',
            buttonColor: storeAction === 'delete' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white',
            warning: storeAction === 'delete' 
                ? 'La vitrine et ses données seront supprimées de la plateforme.' 
                : 'La vitrine sera immédiatement masquée du public et passée en brouillon.',
        },
        user: {
            title: 'Bannir le compte vendeur',
            icon: Ban,
            iconBg: 'bg-red-50 text-[#B91C1C]',
            buttonText: 'Bannir et notifier',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            warning: 'Le vendeur ne pourra plus se connecter et sa vitrine sera immédiatement dépubliée.',
        },
    }[type] || {
        title: 'Action de Modération',
        icon: AlertTriangle,
        iconBg: 'bg-[#FFF3C4] text-[#7A5B00]',
        buttonText: 'Confirmer la décision',
        buttonColor: 'bg-slate-950 text-white',
        warning: 'Une notification sera envoyée.',
    };

    const Icon = config.icon;
    if (!isOpen) return null;

    // Vue intégrée à la page (plus de fenêtre modale) : la liste est masquée par la page pendant l'action
    return (
        <SubPage onClose={onClose} backLabel="Retour" width="max-w-2xl" title={config.title}
            sub={<>Élément concerné : <strong className="font-medium text-[#141412]">{itemName}</strong>{targetInfo && <span className="block text-[#8B8A83]">{targetInfo}</span>}</>}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start gap-3 rounded-2xl bg-[#F6F5F1] p-4 text-[14px] text-[#3D3C37]">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}><Icon className="h-4 w-4" /></span>
                    <p className="pt-1.5">{config.warning}</p>
                </div>

                {type === 'store' && (
                    <div>
                        <p className={labelClass}>Action</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {[['suspend', 'Suspendre', 'Dépublier, passer en brouillon'], ['delete', 'Supprimer', 'Suppression totale de la vitrine']].map(([val, label, hint]) => (
                                <button key={val} type="button" onClick={() => setStoreAction(val)}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${storeAction === val ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/10 hover:border-black/30'}`}>
                                    <span><span className="block text-[14px] font-medium text-[#141412]">{label}</span><span className="text-[13px] text-[#8B8A83]">{hint}</span></span>
                                    {storeAction === val && <Check className="h-4 w-4 text-[#141412]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="moderation-reason" className={labelClass}>Motif communiqué au vendeur</label>
                    <textarea id="moderation-reason" rows={4} value={reason} placeholder="Expliquez clairement la raison de cette décision…"
                        onChange={(e) => { setReason(e.target.value); if (error) setError(''); }}
                        className={`${fieldClass} h-auto py-3`} />
                    {error && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#B91C1C]"><AlertTriangle className="h-3.5 w-3.5" /> {error}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {(reasonSuggestions[type] || []).map((sug) => (
                            <button key={sug} type="button" onClick={() => handleSelectSuggestion(sug)}
                                className="rounded-full border border-black/10 px-3 py-1 text-left text-[13px] text-[#3D3C37] hover:border-black/30">+ {sug}</button>
                        ))}
                    </div>
                </div>

                <p className="flex items-start gap-2 text-[13px] text-[#5F5E58]">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> Le vendeur reçoit ce motif par e-mail et par WhatsApp dès la validation.
                </p>

                <div className="flex flex-wrap justify-end gap-2 border-t border-black/[0.06] pt-5">
                    <Button type="button" onClick={onClose} disabled={isLoading}>Annuler</Button>
                    <Button type="submit" variant={type === 'store' && storeAction === 'suspend' ? 'dark' : 'danger'} disabled={isLoading}>
                        {isLoading ? 'Traitement…' : config.buttonText}
                    </Button>
                </div>
            </form>
        </SubPage>
    );
}
