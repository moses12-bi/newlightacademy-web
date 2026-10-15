import Image from "next/image";

import Container from "@/components/ui/Container";
import type { RevealDelay } from "@/components/ui/PageHero";

import { DEFAULT_TEAM, TEAM_GROUP_PHOTO, type TeamMember } from "./team-data";

/* Entrance stagger, repeating for longer teams. */
const DELAYS: (RevealDelay | undefined)[] = [undefined, "200", "400", "600"];

/**
 * #25b79f4 + #f1b0259 — the introduction band, the whole team together, and a
 * portrait card for each member of staff.
 *
 * The cards are deliberately static. The theme's flip boxes turned each portrait
 * into a blank white panel of text on hover; a staff page is for seeing who
 * teaches here, so the photograph stays in view.
 *
 * `members` comes from the staff portal (Staff), Head Teacher first. A card with
 * no confirmed name shows the photograph alone rather than a guessed caption.
 */
export default function TeachersTeam({ members = DEFAULT_TEAM }: { members?: TeamMember[] }) {
  return (
    <>
      <section className="teachers-band">
        <Container>
          <div className="teachers-band__inner">
            {/* #15848fb — decorative display word, no reveal in the save. */}
            <p className="teachers-display">Our</p>
            <h2>teachers are patient and known to every child.</h2>
          </div>
        </Container>
      </section>

      <section className="teachers-team" aria-label="Our teaching team">
        <Container>
          <figure className="team-group" data-reveal="fadeIn">
            <Image
              src={TEAM_GROUP_PHOTO.src}
              alt={TEAM_GROUP_PHOTO.alt}
              width={TEAM_GROUP_PHOTO.width}
              height={TEAM_GROUP_PHOTO.height}
              sizes="(min-width: 1300px) 1260px, 100vw"
            />
            <figcaption className="team-group__caption">Our teaching team</figcaption>
          </figure>

          {members.length > 0 ? (
            <ul className="team-grid">
              {members.map((member, index) => {
                const caption = member.name ?? member.role;
                return (
                  <li
                    key={`${member.photo}-${index}`}
                    className="team-card"
                    data-reveal="fadeInUp"
                    data-delay={DELAYS[index % DELAYS.length]}
                  >
                    <div className="team-card__photo">
                      <Image
                        src={member.photo}
                        alt={
                          member.name
                            ? `${member.name}${member.role ? `, ${member.role}` : ""}`
                            : "A member of the teaching staff"
                        }
                        fill
                        sizes="(min-width: 1025px) 290px, (min-width: 768px) 33vw, 50vw"
                      />
                    </div>
                    {caption ? (
                      <div className="team-card__caption">
                        {member.name ? <p className="team-card__name">{member.name}</p> : null}
                        {member.role ? <p className="team-card__role">{member.role}</p> : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Container>
      </section>
    </>
  );
}
