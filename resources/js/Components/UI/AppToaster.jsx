import { Toaster } from 'sonner';
import { AlertCircle, Check, Info, Loader2, X } from 'lucide-react';

/**
 * Notifications minimalistes : pastille noire, une seule ligne, en haut à droite.
 * La description n'est pas affichée (titre seul, court).
 */
export default function AppToaster() {
    return (
        <Toaster
            position="top-right"
            className="max-sm:!left-3 max-sm:!right-3 max-sm:!w-auto"
            gap={8}
            offset={20}
            mobileOffset={12}
            duration={2500}
            icons={{
                success: <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />,
                error: <X className="h-4 w-4 text-rose-400" strokeWidth={3} />,
                warning: <AlertCircle className="h-4 w-4 text-amber-300" />,
                info: <Info className="h-4 w-4 text-white/70" />,
                loading: <Loader2 className="h-4 w-4 animate-spin text-white/70" />,
            }}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: 'ml-auto !w-fit !left-auto !right-0 flex max-w-[calc(100vw-24px)] sm:max-w-[340px] items-center gap-2.5 rounded-full bg-[#141412] px-4 py-2.5 font-sans text-[13px] font-medium text-white shadow-lg',
                    icon: 'flex shrink-0 items-center',
                    content: 'min-w-0',
                    title: 'truncate',
                    description: 'hidden',
                    actionButton: 'ml-1 shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/25',
                    cancelButton: 'hidden',
                },
            }}
        />
    );
}
