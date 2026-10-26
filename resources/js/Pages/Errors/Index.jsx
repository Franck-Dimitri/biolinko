import { Clock, SearchX, ServerCrash, ShieldAlert, Wrench } from 'lucide-react';
import ErrorShell from '@/Components/ErrorShell';

const ERRORS = {
    404: [SearchX, 'Page introuvable', 'La page que vous cherchez n’existe pas ou a été déplacée.'],
    403: [ShieldAlert, 'Accès non autorisé', 'Vous n’avez pas les droits nécessaires pour consulter cette page.'],
    500: [ServerCrash, 'Un problème est survenu', 'Une erreur inattendue s’est produite de notre côté. Réessayez dans quelques instants.'],
    503: [Wrench, 'Maintenance en cours', 'Biolinko est en cours de mise à jour. Nous revenons très vite.'],
    419: [Clock, 'Session expirée', 'Pour votre sécurité, votre session a expiré. Rechargez la page pour continuer.'],
};

export default function ErrorIndex({ status = 404 }) {
    const [Icon, title, description] = ERRORS[status] || ERRORS[404];
    const back = () => (window.history.length > 1 ? window.history.back() : (window.location.href = '/'));

    return (
        <ErrorShell
            headTitle={`${title}, Biolinko`}
            code={status}
            Icon={Icon}
            title={title}
            description={description}
            actions={[
                status === 500 || status === 419
                    ? { label: 'Recharger la page', onClick: () => window.location.reload(), primary: true }
                    : { label: 'Retour à l’accueil', href: '/', primary: true },
                { label: 'Page précédente', onClick: back },
            ]}
        />
    );
}
