import React from 'react';

interface RetroButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({
    children,
    onClick,
    className = "",
    type = "button",
    variant = 'primary',
    disabled = false
}) => {
    const baseStyles = "px-4 py-2 border font-mono-custom text-xs uppercase tracking-widest transition-all duration-150 active:translate-y-0.5 active:shadow-none";
    const variants = {
        primary: "bg-black text-white border-black hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]",
        secondary: "bg-white text-black border-zinc-300 hover:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

export default RetroButton;
