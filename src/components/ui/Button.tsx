import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline";

export interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const baseClasses =
  "theme-button inline-flex items-center justify-center gap-2 rounded-[4px] border px-6 py-3 text-[15px] font-normal leading-tight transition-[color,background-color,border-color,transform] duration-300 hover:scale-110 focus-visible:scale-110";

const variantClasses: Record<ButtonVariant, string> = {
  solid: "border-transparent bg-accent-1 text-accent-5 hover:bg-accent-3",
  outline:
    "border-accent-1 bg-transparent text-accent-1 hover:border-accent-3 hover:bg-accent-3 hover:text-accent-5",
};

/** `http(s)://`, `tel:` and `mailto:` targets leave the app, so they get a plain anchor. */
function isExternal(href: string): boolean {
  return /^(https?:|tel:|mailto:)/i.test(href);
}

export default function Button({ href, children, variant = "solid", className, onClick }: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(" ");

  if (isExternal(href)) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}
