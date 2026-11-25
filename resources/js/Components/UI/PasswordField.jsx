import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Champ mot de passe avec l'œil pour afficher ou masquer ce qu'on tape. */
export default function PasswordField({ className = '', ...props }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input {...props} type={show ? 'text' : 'password'} className={`${className} pr-11`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={show}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8B8A83] hover:text-[#141412]">
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
        </div>
    );
}
