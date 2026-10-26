import { usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

const NAMES = { pro: 'Pro', growth: 'Growth', business: 'Business' };

/** Rappel du plan choisi sur la landing, affiché sur la connexion et l'inscription. */
export default function PlanIntentBanner({ plan, action }) {
    const prices = usePage().props.planPrices || {};
    if (!plan || !NAMES[plan]) return null;

    return (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#FFCC00]/60 bg-[#FFF8D6] p-4 text-sm text-slate-900">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
                Plan <strong>{NAMES[plan]}</strong>
                {prices[plan] ? ` · ${Number(prices[plan]).toLocaleString('fr-FR')} FCFA / mois` : ''} sélectionné.{' '}
                {action} vous arriverez directement sur le paiement de votre abonnement.
            </p>
        </div>
    );
}
