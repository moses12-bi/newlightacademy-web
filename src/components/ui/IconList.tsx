import { DotCircleIcon } from "@/components/ui/icons";

export interface IconListProps {
  items: string[];
  className?: string;
}

/** Bulleted feature list: orange ring-and-dot marker, 15px row gap. */
export default function IconList({ items, className }: IconListProps) {
  return (
    <ul className={["flex flex-col gap-[15px]", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          {/* mt nudges the marker onto the first line's optical centre */}
          <DotCircleIcon className="mt-[6px] h-[15px] w-[15px] shrink-0 text-accent-1" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
