import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fcfa } from '@/Components/Dashboard/UI';

const NAMES = { pro: 'Pro', growth: 'Growth', business: 'Business' };

/**
 * Économie réelle qu'aurait faite le vendeur avec un plan supérieur sur ses 30 derniers jours
 * (commission + abonnement). N'apparaît que si le passage est rentable pour lui.
 */
export default function UpgradeHint({ hint, compact = false }) {
    if (!hint) return null;
    const name = NAMES[hint.plan] || hint.plan;

    return (
        <div className="flex flex-col gap-4 rounded-3xl border border-[#FFCC00]/60 bg-[#FFFBEA] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFCC00]"><Sparkles className="h-5 w-5 text-[#141412]" /></span>
                <p className="text-[14px] text-[#3D3C37]">
                    Ces 30 derniers jours, vous avez payé <strong className="font-medium text-[#141412]">{fcfa(hint.commission_paid)}</strong> de commission sur {fcfa(hint.sales)} de ventes.
                    {' '}Avec le plan {name}, abonnement compris, vous auriez payé {fcfa(hint.would_pay)} : <strong className="font-medium text-[#15803D]">{fcfa(hint.saving)} d’économie</strong>.
                </p>
            </div>
            {!compact && (
                <Link href={route('seller.subscriptions.index', { plan: hint.plan })} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#141412] px-4 text-[14px] font-medium text-white hover:bg-[#2B2A26]">
                    Passer au plan {name} <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}
