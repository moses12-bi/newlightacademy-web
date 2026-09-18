import type { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The theme's content well. The source container measures 1260px of CONTENT at
 * 1440px (its own padding is 0; the 30px gutter lives on the section), so the
 * cap here is 1260 + 2x30. Verified against the original: 1260 at 1440px,
 * 1220 at 1280px, 964 at 1024px.
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={["mx-auto w-full max-w-[1320px] px-5 md:px-[30px]", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
