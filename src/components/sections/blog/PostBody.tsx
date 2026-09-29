import type { ReactNode } from "react";

/**
 * Renders the portal's plain-text article format: blocks separated by blank
 * lines; a block starting `## ` is a heading, a block of `- ` lines is a list,
 * anything else is a paragraph (single line breaks kept). No HTML is ever
 * interpreted, so nothing typed in the portal can inject markup.
 */
export default function PostBody({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="blog-post__body">
      {blocks.map((block, index): ReactNode => {
        if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*] /.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, item) => (
                <li key={item}>{line.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, item) => (
              <span key={item}>
                {item > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
