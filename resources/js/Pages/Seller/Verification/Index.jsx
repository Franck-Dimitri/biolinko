import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BadgeCheck, Camera, Clock, IdCard, Lock, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { Button, Card, CardHeader, Field, PageHeader, fieldClass, shortDate } from '@/Components/Dashboard/UI';

/** Champ photo avec aperçu : ouvre l'appareil photo sur téléphone. */
function PhotoInput({ id, label, hint, file, onChange, error, Icon = Upload, capture }) {
    const [preview, setPreview] = useState(null);
    useEffect(() => {
        if (!file) { setPreview(null); return undefined; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-[14px] font-medium text-[#141412]">{label}</label>
            <label htmlFor={id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-3 transition-colors ${error ? 'border-red-300' : 'border-black/15 hover:border-black/30'}`}>
                <span className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">
                    {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Icon className="h-6 w-6 text-[#8B8A83]" />}
                </span>
                <span className="min-w-0 text-[14px]">
                    <span className="block font-medium text-[#141412]">{file ? 'Changer la photo' : 'Choisir une photo'}</span>
                    <span className="block text-[13px] text-[#8B8A83]">{file ? file.name : hint}</span>
                </span>
            </label>
            <input id={id} type="file" accept="image/jpeg,image/png,image/webp" capture={capture} className="sr-only" onChange={(e) => onChange(e.target.files?.[0] || null)} />
            {error && <p className="mt-1.5 text-[13px] text-[#B91C1C]">{error}</p>}
        </div>
    );
}

export default function Index({ verification, details, idTypes = {}, twoSided = [] }) {
    const status = verification?.status || 'none';
    const form = useForm({
        full_name: details?.full_name || '',
        id_type: details?.id_type || 'cni',
        id_number: details?.id_number || '',
        id_front: null,
        id_back: null,
        selfie: null,
    });
    const needsBack = twoSided.includes(form.data.id_type);

    const submit = (e) => {
        e.preventDefault();
        form.post(route('seller.verification.store'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Vérification d’identité, Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Vérification d’identité" sub="Une seule fois, avant votre premier retrait. Elle protège vos clients et votre argent." />

                {status === 'approved' && (
                    <Card>
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D]"><BadgeCheck className="h-5 w-5" /></span>
                            <div>
                                <h2 className="text-[17px] font-medium text-[#141412]">Identité vérifiée</h2>
                                <p className="mt-1 text-[14px] text-[#5F5E58]">Votre boutique affiche le badge « Vendeur vérifié » et vous pouvez retirer votre argent.</p>
                            </div>
                        </div>
                    </Card>
                )}

                {status === 'pending' && (
                    <Card>
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4] text-[#7A5B00]"><Clock className="h-5 w-5" /></span>
                            <div>
                                <h2 className="text-[17px] font-medium text-[#141412]">Vérification en cours</h2>
                                <p className="mt-1 text-[14px] text-[#5F5E58]">
                                    Documents envoyés le {shortDate(verification.submitted_at)}. Nous les vérifions sous 24 à 48 h. Vous pouvez continuer à vendre pendant ce temps.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {status === 'rejected' && (
                    <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-[14px] text-[#B91C1C]" role="alert">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p><span className="font-medium">Documents refusés :</span> {verification.rejection_reason} Envoyez de nouvelles photos ci-dessous.</p>
                    </div>
                )}

                {(status === 'none' || status === 'rejected') && (
                    <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
                        <Card>
                            <form onSubmit={submit} className="space-y-6">
                                <CardHeader title="Vos documents" sub="Photos nettes, en entier, sans reflet. JPG, PNG ou WEBP, 6 Mo maximum." />
                                <Field label="Nom complet" hint="Exactement comme sur votre pièce d’identité." error={form.errors.full_name}>
                                    <input required value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} className={fieldClass} />
                                </Field>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Type de pièce" error={form.errors.id_type}>
                                        <select value={form.data.id_type} onChange={(e) => form.setData('id_type', e.target.value)} className={fieldClass}>
                                            {Object.entries(idTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Numéro de la pièce" hint="Facultatif." error={form.errors.id_number}>
                                        <input value={form.data.id_number} onChange={(e) => form.setData('id_number', e.target.value)} className={fieldClass} />
                                    </Field>
                                </div>
                                <PhotoInput id="id_front" label="Recto de la pièce" hint="La face avec votre photo." Icon={IdCard}
                                    file={form.data.id_front} onChange={(f) => form.setData('id_front', f)} error={form.errors.id_front} />
                                {needsBack && (
                                    <PhotoInput id="id_back" label="Verso de la pièce" hint="L’autre face de la pièce." Icon={IdCard}
                                        file={form.data.id_back} onChange={(f) => form.setData('id_back', f)} error={form.errors.id_back} />
                                )}
                                <PhotoInput id="selfie" label="Selfie avec la pièce" hint="Votre visage et la pièce tenue près du visage." Icon={Camera} capture="user"
                                    file={form.data.selfie} onChange={(f) => form.setData('selfie', f)} error={form.errors.selfie} />
                                {form.progress && (
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2F1EC]" role="progressbar" aria-label="Envoi des photos" aria-valuemin={0} aria-valuemax={100} aria-valuenow={form.progress.percentage}>
                                        <div className="h-full rounded-full bg-[#FFCC00]" style={{ width: `${form.progress.percentage}%` }} />
                                    </div>
                                )}
                                <div className="flex justify-end border-t border-black/[0.06] pt-6">
                                    <Button variant="primary" type="submit" disabled={form.processing}>{form.processing ? 'Envoi…' : 'Envoyer pour vérification'}</Button>
                                </div>
                            </form>
                        </Card>

                        <Card>
                            <div className="space-y-4 text-[14px] text-[#5F5E58]">
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#141412]" />
                                    <p><span className="font-medium text-[#141412]">Pourquoi ?</span> Pour qu’une fausse boutique ne puisse jamais encaisser l’argent de clients. Les vendeurs vérifiés affichent un badge qui rassure les acheteurs.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#141412]" />
                                    <p><span className="font-medium text-[#141412]">Vos documents restent privés.</span> Ils ne sont jamais publiés ni partagés : seule l’équipe Biolinko les consulte pour la vérification. En cas de refus, ils sont supprimés.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
