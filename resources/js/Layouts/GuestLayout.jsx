import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-2.5 group">
                    <ApplicationLogo className="h-16 w-16 shadow-md group-hover:scale-105 transition-transform" />
                    <span className="text-2xl font-black tracking-tight text-slate-950 font-display">
                        biolinko<span className="text-[#FFCC00]">.</span>
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
