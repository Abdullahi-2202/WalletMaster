import * as React from "react"

import { cn } from "@/lib/utils"

// Completely stripped down input with no validation
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, required, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        required={false}
        aria-required="false"
        formNoValidate
        autoComplete="off"
        {...props}
        onInvalid={(e) => {
          // Prevent any validation errors
          e.preventDefault();
        }}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
