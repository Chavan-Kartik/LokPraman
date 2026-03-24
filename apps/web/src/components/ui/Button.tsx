import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
    default: "bg-[var(--accent)] text-white shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:bg-[var(--accent-bright)] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.7),0_8px_22px_rgba(94,106,210,0.36),inset_0_1px_0_0_rgba(255,255,255,0.24)]",
    destructive: "bg-red-500/90 text-white shadow-[0_0_0_1px_rgba(244,63,94,0.35),0_10px_20px_rgba(127,29,29,0.3)] hover:bg-red-500",
    outline: "border border-[var(--border-default)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-hover)]",
    secondary: "bg-[var(--surface)] text-[var(--foreground)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:bg-[var(--surface-hover)]",
    ghost: "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
    link: "text-[var(--accent)] underline-offset-4 hover:text-[var(--accent-bright)] hover:underline",
}

const buttonSizes = {
    default: "h-11 px-5 py-2.5 rounded-lg",
    sm: "h-9 px-3.5 rounded-lg",
    lg: "h-12 px-7 rounded-lg text-base",
    icon: "h-10 w-10 rounded-lg",
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                data-variant={variant}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium tracking-tight ring-offset-[var(--background-base)] transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    buttonVariants[variant],
                    buttonSizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
