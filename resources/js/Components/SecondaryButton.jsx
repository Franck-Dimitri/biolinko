export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold  text-[#3D3C37] shadow-sm transition duration-150 ease-in-out hover:bg-[#F6F5F1] focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
