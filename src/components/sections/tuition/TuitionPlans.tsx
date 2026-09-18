import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ShapeDivider from "@/components/ui/ShapeDivider";

export interface TuitionPlan {
  name: string;
  years: string;
  /**
   * The fee figure, as a plain string so any currency can be dropped in later.
   * Left unset until the school confirms its own fees: the card then renders
   * without a price line rather than showing an invented or placeholder amount.
   */
  price?: string;
  /** Currency mark printed before `price` — e.g. "RWF". Unset while `price` is. */
  currency?: string;
  /** What the figure covers, once the school confirms it. Unset while `price` is. */
  period?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

/**
 * The six `price-table` widgets — post-1066 #42ce0ec, #dd22121, #1c0f132
 * (first band) and #9a1aa75, #b1ed9ea, #a321471 (second band).
 *
 * Each tier is a list item holding a real definition list: the visually hidden
 * `dt`s name what the big number and the bullet actually are, so the classes
 * are still comprehensible when the visual hierarchy is gone.
 *
 * The bands are the school's own levels: pre-primary (Baby, Middle and Top
 * Class) first, then the six primary years. No `price` is set on any card —
 * see the field's note above — so every card renders its name, level and age
 * band, then the button, with the price line cleanly absent.
 */
export const FIRST_BAND: TuitionPlan[] = [
  {
    name: "Baby Class",
    years: "Pre-primary",
    features: ["Ages 3 - 4"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
  {
    name: "Middle Class",
    years: "Pre-primary",
    features: ["Ages 4 - 5"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
  {
    name: "Top Class",
    years: "Pre-primary",
    features: ["Ages 5 - 6"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
];

export const SECOND_BAND: TuitionPlan[] = [
  {
    name: "P1 - P2",
    years: "Lower primary",
    features: ["Reading, writing and number"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
  {
    name: "P3 - P4",
    years: "Middle primary",
    features: ["The Rwanda national curriculum"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
  {
    name: "P5 - P6",
    years: "Upper primary",
    features: ["Towards the P6 examination"],
    ctaLabel: "Apply now",
    ctaHref: "/how-to-apply",
  },
];

function PlanCard({ plan }: { plan: TuitionPlan }) {
  return (
    <div className="tui-plan">
      <div className="tui-plan__header">
        {/* The saved heading is an `h3` under the page `h1`; rendered a level up
            so the outline has no gap, with the price table's own 44/33px Sensei
            scale pinned in admissions.css. */}
        <h2 className="tui-plan__name">{plan.name}</h2>
        <p className="tui-plan__subheading">{plan.years}</p>
      </div>

      <dl className="tui-plan__facts">
        {plan.price ? (
          <>
            <dt className="sr-only">Fees</dt>
            <dd className="tui-plan__price">
              {plan.currency ? <span className="tui-plan__currency">{plan.currency}</span> : null}
              <span>{plan.price}</span>
              {plan.period ? <span className="tui-plan__period">{plan.period}</span> : null}
            </dd>
          </>
        ) : null}

        <dt className="sr-only">Details</dt>
        <dd>
          <ul className="tui-plan__features">
            {plan.features.map((feature) => (
              <li className="tui-plan__feature" key={feature}>
                {feature}
              </li>
            ))}
          </ul>
        </dd>
      </dl>

      <div className="tui-plan__footer">
        <Button href={plan.ctaHref}>{plan.ctaLabel}</Button>
      </div>
    </div>
  );
}

export interface TuitionPlansProps {
  plans: TuitionPlan[];
  /** The second band carries the mountain illustration and the wavy edge. */
  second?: boolean;
}

export default function TuitionPlans({ plans, second }: TuitionPlansProps) {
  return (
    <section
      className={[
        "adm-band",
        "adm-band--cream",
        "tui-plans-band",
        second ? "tui-plans-band--second" : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {second ? <ShapeDivider position="bottom" /> : null}
      <Container>
        <ul className={`tui-plans ${second ? "tui-plans--second" : "tui-plans--first"}`}>
          {plans.map((plan) => (
            <li key={plan.name}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
