import { Link } from '@inertiajs/react';
import LegalLayout, { Note } from '@/Layouts/LegalLayout';

const PENDING = 'en cours d’immatriculation';

// Une ligne n'apparaît que si l'information est renseignée (config/biolinko.php)
function Rows({ rows }) {
    return (
        <ul>
            {rows.filter(([, v]) => v).map(([k, v]) => <li key={k}><strong>{k} :</strong> {v}</li>)}
        </ul>
    );
}

export default function Notice({ publisher = {}, host = {}, contact = {} }) {
    const sections = [
        {
            id: 'editeur',
            title: 'Éditeur de la plateforme',
            body: (
                <>
                    <p>La plateforme Biolinko, accessible à l’adresse biolinko.link, est éditée par :</p>
                    <Rows rows={[
                        ['Nom', publisher.name || 'Biolinko'],
                        ['Statut', publisher.status || PENDING],
                        ['Immatriculation', publisher.registration],
                        ['Adresse', publisher.address || contact.city],
                        ['Responsable de la publication', publisher.director],
                        ['Contact', contact.email],
                    ]} />
                    {!publisher.status && <Note>Biolinko est en phase pilote. Les informations d’immatriculation seront publiées sur cette page dès leur obtention.</Note>}
                </>
            ),
        },
        {
            id: 'hebergement',
            title: 'Hébergement',
            body: host.name
                ? <Rows rows={[['Hébergeur', host.name], ['Adresse', host.address]]} />
                : <p>Les informations sur l’hébergeur du site seront publiées ici à la mise en production.</p>,
        },
        {
            id: 'paiements',
            title: 'Paiements',
            body: <p>Les paiements Mobile Money sont traités par un prestataire de paiement spécialisé et par les opérateurs concernés (MTN, Orange). Biolinko n’a jamais accès au code secret Mobile Money des utilisateurs.</p>,
        },
        {
            id: 'propriete',
            title: 'Propriété intellectuelle',
            body: <p>La marque Biolinko, son logo, ses interfaces et son code sont protégés. Les contenus publiés sur les boutiques (photos, textes, logos) appartiennent à leurs vendeurs respectifs.</p>,
        },
        {
            id: 'documents',
            title: 'Autres documents',
            body: (
                <ul>
                    <li><Link href={route('legal.terms')} className="underline underline-offset-2">Conditions d’utilisation</Link></li>
                    <li><Link href={route('legal.privacy')} className="underline underline-offset-2">Politique de confidentialité</Link></li>
                    <li><Link href={route('legal.cookies')} className="underline underline-offset-2">Politique cookies</Link></li>
                </ul>
            ),
        },
    ];

    return (
        <LegalLayout title="Mentions légales" intro="Qui édite Biolinko, qui l’héberge et comment nous contacter." updatedAt="13 novembre 2026" sections={sections} />
    );
}
