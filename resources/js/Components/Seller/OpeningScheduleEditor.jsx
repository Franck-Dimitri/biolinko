import { Copy } from 'lucide-react';
import { fieldClass } from '@/Components/Dashboard/UI';

/*
 * Horaires par jour : la vitrine affiche « Ouvert · ferme à 23 h » ou « Fermé · ouvre demain à 11 h ».
 * Valeur : { mon: { open, close } | null, … } (même format que App\Support\OpeningHours).
 */
export const DAYS = [['mon', 'Lundi'], ['tue', 'Mardi'], ['wed', 'Mercredi'], ['thu', 'Jeudi'], ['fri', 'Vendredi'], ['sat', 'Samedi'], ['sun', 'Dimanche']];

export default function OpeningScheduleEditor({ value, onChange }) {
    const schedule = value || {};
    const set = (day, slot) => onChange({ ...schedule, [day]: slot });
    const first = DAYS.map(([d]) => schedule[d]).find(Boolean);

    return (
        <div className="space-y-2">
            {!first && <p className="text-[12px] text-[#8B8A83]">Facultatif : cochez vos jours d’ouverture pour afficher « Ouvert » ou « Fermé » sur la boutique.</p>}
            {DAYS.map(([day, label]) => {
                const slot = schedule[day];
                return (
                    <div key={day} className="grid grid-cols-[110px_1fr] items-center gap-3 sm:grid-cols-[130px_1fr]">
                        <label className="flex items-center gap-2 text-[14px] text-[#141412]">
                            <input type="checkbox" checked={!!slot} onChange={(e) => set(day, e.target.checked ? (first || { open: '08:00', close: '18:00' }) : null)}
                                className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" /> {label}
                        </label>
                        {slot ? (
                            <div className="flex items-center gap-2">
                                <input type="time" aria-label={`Ouverture le ${label.toLowerCase()}`} value={slot.open} onChange={(e) => set(day, { ...slot, open: e.target.value })} className={`${fieldClass} w-auto`} />
                                <span className="text-[13px] text-[#8B8A83]">à</span>
                                <input type="time" aria-label={`Fermeture le ${label.toLowerCase()}`} value={slot.close} onChange={(e) => set(day, { ...slot, close: e.target.value })} className={`${fieldClass} w-auto`} />
                            </div>
                        ) : <span className="text-[13px] text-[#8B8A83]">{first ? 'Fermé' : 'Non renseigné'}</span>}
                    </div>
                );
            })}
            {first && (
                <button type="button" onClick={() => onChange(Object.fromEntries(DAYS.map(([d]) => [d, schedule[d] ? first : null])))}
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#5F5E58] underline underline-offset-2 hover:text-[#141412]">
                    <Copy className="h-3.5 w-3.5" /> Mêmes horaires pour tous les jours ouverts
                </button>
            )}
            <p className="text-[12px] text-[#8B8A83]">Une fermeture avant l’ouverture passe minuit (ex. 18:00 à 02:00).</p>
        </div>
    );
}
