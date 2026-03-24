import * as React from "react"
import { cn } from "../../lib/utils"

const cardVariants = {
    default: "linear-elevated",
    glass: "bg-white/[0.04] border border-[var(--border-default)] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]",
    gradient: "border border-[var(--border-default)] bg-[radial-gradient(circle_at_top,rgba(94,106,210,0.18),rgba(255,255,255,0.04)_45%,rgba(255,255,255,0.02)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]",
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof cardVariants
}

const Card = React.forwardRef<
    HTMLDivElement,
    CardProps
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        data-ui="card"
        data-variant={variant}
        className={cn(
            "rounded-2xl p-0 overflow-hidden text-[var(--foreground)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            cardVariants[variant],
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-semibold leading-tight tracking-tight text-[var(--foreground)]",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-[var(--foreground-muted)] font-medium mt-2", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0 mt-auto", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
