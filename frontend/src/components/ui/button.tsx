import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
  {
    variants: {
      variant: {
        default: "animate-sheen bg-gradient-to-r from-primary to-secondary text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glass",
        secondary: "bg-[#f4f2ff] text-primary hover:-translate-y-0.5 hover:bg-[#ede9ff] hover:shadow-soft dark:bg-primary/15 dark:text-white",
        outline: "border border-slate-200 bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-white",
        ghost: "text-muted hover:bg-[#f6f4ff] hover:text-primary dark:text-slate-300 dark:hover:bg-white/10",
        danger: "bg-danger text-white shadow-soft hover:-translate-y-0.5 hover:bg-red-500"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
