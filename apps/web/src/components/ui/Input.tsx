import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                data-ui="input"
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--background-elevated)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] ring-offset-[var(--background-base)] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50 focus-visible:ring-offset-2 focus-visible:border-[var(--border-accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
