// lucide-react v1 n'inclut plus les logos de marques : versions simplifiées au trait.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', 'aria-hidden': true };

export const InstagramIcon = ({ className = 'w-5 h-5' }) => (
    <svg {...base} className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
);

export const TiktokIcon = ({ className = 'w-5 h-5' }) => (
    <svg {...base} className={className}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.6 2.4 4.5 5 4.8" /></svg>
);

export const FacebookIcon = ({ className = 'w-5 h-5' }) => (
    <svg {...base} className={className}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></svg>
);

export const WhatsappIcon = ({ className = 'w-5 h-5' }) => (
    <svg {...base} className={className}><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2L9 9.5z" /></svg>
);
