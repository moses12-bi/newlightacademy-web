export interface ShapeDividerProps {
  position: "top" | "bottom";
  className?: string;
}

export default function ShapeDivider({ position, className }: ShapeDividerProps) {
  const classes = [
    "pointer-events-none absolute inset-x-0 z-[2] h-[28px] leading-[0]",
    position === "top" ? "top-0" : "bottom-0 rotate-180",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-hidden="true">
      <div className="shape-wave h-full w-full" />
    </div>
  );
}
