import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { configureStoreUrls } from '@/Components/Storefront/storeUrl';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    // Titres de référencement (« … | … ») déjà complets : pas de suffixe
    title: (title) => (!title ? appName : title.includes(' | ') ? title : `${title} - ${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        configureStoreUrls(props.initialPage?.props?.site);
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#F59E0B',
        includeCSS: true,
        showSpinner: false,
        delay: 200,
    },
});
