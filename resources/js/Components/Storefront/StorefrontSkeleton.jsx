export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-3 shadow-2xs animate-pulse flex flex-col justify-between">
            <div className="h-48 bg-slate-200/70 rounded-2xl w-full mb-3" />
            <div className="p-2 space-y-2.5">
                <div className="h-2.5 bg-slate-200/70 rounded-full w-1/3" />
                <div className="h-3.5 bg-slate-200/80 rounded-full w-4/5" />
                <div className="h-3.5 bg-slate-200/80 rounded-full w-1/2" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="h-4 bg-slate-200/80 rounded-full w-20" />
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="w-full h-80 sm:h-96 rounded-[32px] bg-slate-200/70 animate-pulse border border-slate-200/60 p-8 flex flex-col justify-between">
            <div className="space-y-3 max-w-md">
                <div className="h-4 bg-slate-300/70 rounded-full w-24" />
                <div className="h-8 bg-slate-300/80 rounded-full w-3/4" />
                <div className="h-4 bg-slate-300/60 rounded-full w-1/2" />
            </div>
            <div className="flex gap-3">
                <div className="h-10 bg-slate-300/80 rounded-2xl w-32" />
                <div className="h-10 bg-slate-300/60 rounded-2xl w-24" />
            </div>
        </div>
    );
}

export default function StorefrontSkeleton() {
    return (
        <div className="space-y-10 w-full animate-pulse">
            <HeroSkeleton />
            <div className="flex gap-2 overflow-hidden py-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-28 rounded-full bg-slate-200/70 shrink-0" />
                ))}
            </div>
            <ProductGridSkeleton count={8} />
        </div>
    );
}
