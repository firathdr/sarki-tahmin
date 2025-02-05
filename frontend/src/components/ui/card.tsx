// src/components/ui/card.tsx
import React from "react";

interface CardProps {
    children: React.ReactNode; // ReactMode -> ReactNode
}

const Card: React.FC<CardProps> = ({ children }) => { // Tip tanımı düzeltildi
    return (
        <div className="border p-4 rounded shadow-md bg-white">
            {children}
        </div>
    );
};

// CardContent eklenmemişse ya ekleyin ya da import'tan kaldırın
export const CardContent: React.FC = ({ children }) => (
    <div className="p-4">{children}</div>
);

export default Card; // Default export