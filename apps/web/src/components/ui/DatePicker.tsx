import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = 'dd/mm/yyyy' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onChange(formatDate(selectedDate));
        setIsOpen(false);
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const firstDay = firstDayOfMonth(currentMonth);
        const selectedDate = value ? new Date(value) : null;

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth.getMonth() &&
                selectedDate.getFullYear() === currentMonth.getFullYear();

            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear();

            days.push(
                <button
                    key={day}
                    data-ui="datepicker-day"
                    data-selected={Boolean(isSelected)}
                    data-today={Boolean(isToday)}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`h-10 rounded-md text-sm font-medium transition-colors ${isSelected
                        ? 'bg-indigo-600 text-white'
                        : isToday
                            ? 'bg-[var(--surface-hover)] text-[var(--foreground)]'
                            : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
                        }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div ref={pickerRef} className="relative">
            <button
                data-ui="datepicker-trigger"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-full items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--background-elevated)] px-4 py-3 text-sm text-[var(--foreground)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#464ace] focus-visible:border-[#464ace]"
            >
                <span className={value ? '' : 'text-[var(--foreground-muted)]'}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <CalendarIcon size={18} className="text-[var(--foreground-muted)]" />
            </button>

            {isOpen && (
                <div data-ui="datepicker-panel" className="absolute z-[100] top-full mt-2 left-0 w-80 rounded-md border border-[var(--border-default)] bg-[var(--background-elevated)] shadow-xl p-4">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            data-ui="datepicker-nav"
                            type="button"
                            onClick={previousMonth}
                            className="p-2 rounded-md transition-colors hover:bg-[var(--surface)] text-[var(--foreground-muted)]"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="font-semibold text-[var(--foreground)]">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            data-ui="datepicker-nav"
                            type="button"
                            onClick={nextMonth}
                            className="p-2 rounded-md transition-colors hover:bg-[var(--surface)] text-[var(--foreground-muted)]"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div
                                key={day}
                                className="h-8 flex items-center justify-center text-xs font-medium text-[var(--foreground-muted)]"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};
