// src/components/ui/button.tsx
import React from "react";

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
            {children}
        </button>
    );
};

export default Button;
