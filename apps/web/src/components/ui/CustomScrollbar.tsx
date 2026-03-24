import React from 'react';

interface CustomScrollbarProps {
    children: React.ReactNode;
    className?: string;
    maxHeight?: string;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
    children,
    className = '',
    maxHeight = '100%'
}) => {
    return (
        <div
            className={`custom-scrollbar themed-scrollbar ${className}`}
            style={{
                maxHeight,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
        >
            {children}
        </div>
    );
};
