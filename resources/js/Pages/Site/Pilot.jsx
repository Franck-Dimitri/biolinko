import { useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, Loader2, MessageCircle, Rocket, Sparkles, Store } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';

const field = 'h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-[15px] text-[#141412] placeholder:text-[#B5B3AB] focus:border-black/30 focus:ring-0';
const label = 'mb-1.5 block text-[14px] font-medium text-[#141412]';

const PERKS = [
    [Store, 'Votre boutique installée avec vous', 'Nous créons votre boutique ensemble : produits, photos, livraison et paiement, prêts à vendre.'],
    [MessageCircle, 'Un accompagnement direct', 'Un contact WhatsApp avec l’équipe pendant vos premières ventes, pour répondre à vos questions.'],
    [Sparkles, 'Vos idées comptent', 'Vos retours décident des prochaines améliorations de Biolinko.'],
];

function FieldError({ msg }) {
    return msg ? <p className="mt-1.5 text-[13px] text-[#B91C1C]">{msg}</p> : null;
}

export default function Pilot({ channels = [], volumes = [] }) {
    const sent = usePage().props.flash?.pilot_sent;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', business_name: '', phone_whatsapp: '', email: '', city: '', category: '', channels: [], monthly_orders: '', message: '', website: '',
    });
    const toggle = (c) => setData('channels', data.channels.includes(c) ? data.channels.filter((x) => x !== c) : [...data.channels, c]);
    const submit = (e) => { e.preventDefault(); post(route('site.pilot.store'), { preserveScroll: true, onSuccess: () => reset() }); };

    return (
        <SiteLayout title="Programme pilote" eyebrow="Programme pilote · Cameroun" heading="Soyez parmi les premiers vendeurs Biolinko"
            intro="Nous lançons Biolinko avec une quinzaine de vendeurs qui vendent déjà en ligne au Cameroun. Nous installons votre boutique avec vous et vous accompagnons pendant vos premières ventes.">
            <Section top={false} className="bg-white py-16 sm:py-20" innerClassName="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div className="space-y-4">
                    {PERKS.map(([Icon, title, text], i) => (
                        <motion.div key={title} {...reveal(i * 0.06)} className="flex gap-4 rounded-[20px] border border-black/[0.08] p-5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#141412] text-[#FFCC00]"><Icon className="h-5 w-5" /></span>
                            <span><span className="block text-[16px] font-medium">{title}</span><span className="mt-1 block text-[14px] leading-relaxed text-[#5F5E58]">{text}</span></span>
                        </motion.div>
                    ))}
                    <motion.div {...reveal(0.2)} className="rounded-[20px] bg-[#FBFAF6] p-5 text-[14px] leading-relaxed text-[#5F5E58]">
                        <p className="font-medium text-[#141412]">Pour qui ?</p>
                        <ul className="mt-2 space-y-1.5">
                            {['Vous vendez déjà sur WhatsApp, Instagram, TikTok ou Facebook', 'Vous êtes au Cameroun et vos clients paient en MTN MoMo ou Orange Money', 'Vous voulez des paiements confirmés, des factures et un suivi des commandes'].map((t) => (
                                <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} /> {t}</li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <motion.div {...reveal(0.1)}>
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div key="ok" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[24px] border border-black/[0.08] p-8 text-center sm:p-12">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-[#16A34A]" />
                                <h2 className="mt-5 text-[24px] font-medium tracking-[-0.02em]">Merci, votre inscription est envoyée</h2>
                                <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-[#5F5E58]">Nous vous contactons sur WhatsApp pour préparer votre boutique ensemble.</p>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={submit} className="space-y-5 rounded-[24px] border border-black/[0.08] p-6 sm:p-8">
                                <div className="flex items-center gap-2 text-[15px] font-medium"><Rocket className="h-5 w-5" /> Rejoindre le programme pilote</div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div><label htmlFor="p-name" className={label}>Votre nom</label><input id="p-name" required value={data.name} onChange={(e) => setData('name', e.target.value)} className={field} placeholder="Ex. Awa Mbarga" /><FieldError msg={errors.name} /></div>
                                    <div><label htmlFor="p-shop" className={label}>Nom de votre boutique</label><input id="p-shop" required value={data.business_name} onChange={(e) => setData('business_name', e.target.value)} className={field} placeholder="Ex. Chez Awa" /><FieldError msg={errors.business_name} /></div>
                                    <div><label htmlFor="p-wa" className={label}>Numéro WhatsApp</label><input id="p-wa" type="tel" inputMode="numeric" required value={data.phone_whatsapp} onChange={(e) => setData('phone_whatsapp', e.target.value)} className={field} placeholder="6XX XX XX XX" /><FieldError msg={errors.phone_whatsapp} /></div>
                                    <div><label htmlFor="p-mail" className={label}>E-mail <span className="font-normal text-[#8B8A83]">(facultatif)</span></label><input id="p-mail" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={field} placeholder="vous@exemple.com" /><FieldError msg={errors.email} /></div>
                                    <div><label htmlFor="p-city" className={label}>Ville</label><input id="p-city" required value={data.city} onChange={(e) => setData('city', e.target.value)} className={field} placeholder="Ex. Douala" /><FieldError msg={errors.city} /></div>
                                    <div><label htmlFor="p-cat" className={label}>Ce que vous vendez</label><input id="p-cat" required value={data.category} onChange={(e) => setData('category', e.target.value)} className={field} placeholder="Ex. vêtements, cosmétiques, électronique" /><FieldError msg={errors.category} /></div>
                                </div>
                                <div>
                                    <span className={label}>Où vendez-vous aujourd’hui ?</span>
                                    <div className="flex flex-wrap gap-2">
                                        {channels.map((c) => {
                                            const on = data.channels.includes(c);
                                            return <button key={c} type="button" aria-pressed={on} onClick={() => toggle(c)} className={`h-10 rounded-full border px-4 text-[14px] transition-colors ${on ? 'border-[#141412] bg-[#141412] text-white' : 'border-black/10 text-[#141412] hover:border-black/30'}`}>{c}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <span className={label}>Combien de commandes par mois environ ?</span>
                                    <div className="flex flex-wrap gap-2">
                                        {volumes.map((v) => {
                                            const on = data.monthly_orders === v;
                                            return <button key={v} type="button" aria-pressed={on} onClick={() => setData('monthly_orders', on ? '' : v)} className={`h-10 rounded-full border px-4 text-[14px] transition-colors ${on ? 'border-[#141412] bg-[#141412] text-white' : 'border-black/10 text-[#141412] hover:border-black/30'}`}>{v}</button>;
                                        })}
                                    </div>
                                </div>
                                <div><label htmlFor="p-msg" className={label}>Un mot sur votre activité <span className="font-normal text-[#8B8A83]">(facultatif)</span></label><textarea id="p-msg" rows={3} maxLength={1000} value={data.message} onChange={(e) => setData('message', e.target.value)} className={`${field} h-auto py-3`} /></div>
                                {/* Champ piège pour les robots, invisible pour les visiteurs */}
                                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} className="hidden" aria-hidden />
                                <button type="submit" disabled={processing} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFCC00] text-[15px] font-medium text-[#141412] hover:bg-[#FFD633] disabled:opacity-60">
                                    {processing && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer ma candidature
                                </button>
                                <p className="text-center text-[12px] text-[#8B8A83]">Vos informations servent uniquement à vous recontacter pour le programme pilote.</p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </Section>
        </SiteLayout>
    );
}
