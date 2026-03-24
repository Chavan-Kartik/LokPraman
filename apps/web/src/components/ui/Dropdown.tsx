import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                data-ui="dropdown-trigger"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background-base)] bg-[var(--background-elevated)] border border-[var(--border-default)] text-[var(--foreground)] hover:border-[var(--border-hover)]"
            >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                <ChevronDown
                    size={16}
                    className={`flex-shrink-0 text-[var(--foreground-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div data-ui="dropdown-menu" className="absolute z-50 w-full mt-2 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_36px_rgba(0,0,0,0.45)] overflow-hidden border border-[var(--border-default)] bg-[var(--background-elevated)] backdrop-blur-xl">
                    {options.map((option) => (
                        <button
                            data-ui="dropdown-option"
                            data-active={option.value === value}
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${option.value === value
                                ? 'bg-[var(--accent)] text-white font-medium'
                                : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
