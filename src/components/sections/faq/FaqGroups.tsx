import Accordion from "@/components/ui/Accordion";
import Container from "@/components/ui/Container";
import FaqTableOfContents from "@/components/sections/faq/FaqTableOfContents";
import { FAQ_GROUPS } from "@/components/sections/faq/faqData";

/**
 * post-1068 #695dd28: the table of contents in a narrow sticky left column
 * (27.46%) and the six accordion groups on the right (72.205%), stacking on
 * phones.
 *
 * Each group heading carries the id the table of contents links to. The saved
 * headings are `h3` under the page `h1`; they are rendered one level up so the
 * outline has no gap, with the original 26px scale pinned in the stylesheet.
 * The accordion's own question headings then sit at `h3` beneath them.
 */
export default function FaqGroups() {
  const tocItems = FAQ_GROUPS.map((group) => ({ id: group.id, title: group.title }));

  return (
    <section className="faq-body">
      <Container>
        <div className="adm-row">
          <div className="faq-toc-col">
            <FaqTableOfContents items={tocItems} />
          </div>

          <div className="faq-groups">
            {FAQ_GROUPS.map((group) => (
              <div className="faq-group" key={group.id}>
                <h2 id={group.id} className="faq-group__heading adm-h3-scale">
                  {group.title}
                </h2>
                <Accordion
                  headingLevel="h3"
                  items={group.entries.map((entry) => ({
                    id: entry.id,
                    title: entry.question,
                    content: <p>{entry.answer}</p>,
                  }))}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
