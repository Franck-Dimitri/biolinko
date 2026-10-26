export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-[#3D3C37] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
