// src/components/ui/input.tsx
import React from "react";

interface InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="px-4 py-2 border border-gray-300 rounded"
        />
    );
};

export default Input;
