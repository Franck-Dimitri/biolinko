import AuthShell from '@/Components/AuthShell';

// Pages d'authentification secondaires (mot de passe oublié, vérification e-mail…) : même habillage que la connexion.
export default function GuestLayout({ children, title, subtitle }) {
    return (
        <AuthShell title={title} subtitle={subtitle}>
            {children}
        </AuthShell>
    );
}
