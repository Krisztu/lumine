import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hover" | "panel"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "glass-card",
            hover: "glass-card hover:scale-[1.02]",
            panel: "glass-panel rounded-3xl",
        }

        return (
            <div
                ref={ref}
                className={cn(variants[variant], "p-6", className)}
                {...props}
            />
        )
    }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
