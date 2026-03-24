import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                data-ui="modal-backdrop"
                className="fixed inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                data-ui="modal-panel"
                className="relative w-full max-w-5xl flex flex-col rounded-2xl linear-elevated my-4 max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-default)] flex-shrink-0">
                    <h2 className="text-lg sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        {title}
                    </h2>
                    <button
                        data-ui="modal-close"
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors flex-shrink-0 text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - scrollable but allows dropdown overflow */}
                <div className="p-4 sm:p-6 overflow-y-auto overflow-x-visible flex-1">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
