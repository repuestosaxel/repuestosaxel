import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white shadow-inner transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/36 focus-visible:border-racing-red/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-red/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
