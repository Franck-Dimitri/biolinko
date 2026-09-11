import { Loader2 } from 'lucide-react';

export default function PrimaryButton({
    className = '',
    disabled = false,
    loading = false,
    processing = false,
    loadingText,
    children,
    ...props
}) {
    const isBusy = Boolean(disabled || loading || processing);

    return (
        <button
            {...props}
            disabled={isBusy}
            aria-busy={isBusy}
            className={
                `inline-flex items-center justify-center gap-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 select-none ${
                    isBusy
                        ? 'opacity-70 cursor-not-allowed pointer-events-none scale-[0.99]'
                        : 'hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                } ${className}`
            }
        >
            {(loading || processing) && (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            )}
            <span>{(loading || processing) && loadingText ? loadingText : children}</span>
        </button>
    );
}
