import type { CSSProperties, ReactNode } from "react";
import { site } from "@/lib/site";

import {
  HandwritingIcon,
  LanguageIcon,
  MovementIcon,
  PrayingHandsIcon,
} from "@/components/sections/careers/CareersIcons";
import Container from "@/components/ui/Container";
import IconBox from "@/components/ui/IconBox";
import ShapeDivider from "@/components/ui/ShapeDivider";

interface Perk {
  numeral: string;
  title: string;
  icon: ReactNode;
  /** `motion_fx` scale, desktop only, straight from each widget's settings. */
  fx: string;
  /** The widget's own top padding, which is what clears its numeral. */
  pad: string;
  /** The saved numeral background-size (76/70/100/82%), as a cqw ratio. */
  numeralRatio: string;
  iconSize: string;
}

const PERKS: Perk[] = [
  {
    numeral: "01",
    title: "Inclusive school",
    icon: <LanguageIcon />,
    fx: '{"scale":{"range":{"start":30,"end":100},"direction":"out-in","speed":4}}',
    pad: "23%",
    numeralRatio: "45",
    iconSize: "59px",
  },
  {
    numeral: "02",
    title: "National curriculum",
    icon: <HandwritingIcon />,
    fx: '{"scale":{"direction":"in-out","range":{"start":1,"end":100},"speed":3}}',
    pad: "15%",
    numeralRatio: "42",
    iconSize: "60px",
  },
  {
    numeral: "03",
    title: "Active learning",
    icon: <MovementIcon />,
    fx: '{"scale":{"direction":"in-out","range":{"start":1,"end":100},"speed":6}}',
    pad: "33%",
    numeralRatio: "58",
    iconSize: "60px",
  },
  {
    numeral: "04",
    title: "Christian values",
    icon: <PrayingHandsIcon />,
    fx: '{"scale":{"range":{"start":0,"end":96},"direction":"in-out","speed":2}}',
    pad: "24%",
    numeralRatio: "48",
    iconSize: "60px",
  },
];

/** #e9b120f — the pale-blue band with the pitch and the four numbered perks. */
export default function CareersPerks() {
  return (
    <section className="careers-perks">
      <ShapeDivider position="bottom" />
      <div className="careers-perks__inner">
        <Container>
          {/* #303feb7 */}
          <p className="careers-lede__display" data-reveal="zoomInDown">
            {site.name}
          </p>
          <div className="careers-lede__body">
            <h2>welcomes teachers who would like to work with our children</h2>
            <p>
              We are a Christian nursery and primary day school in Kinyinya, Kigali, accredited by NESA and
              following the Rwanda national curriculum. If you would like to teach here, we would be glad to
              hear from you: our phone number and email address are at the bottom of every page.
            </p>
          </div>

          {/* #5634b98 */}
          <div className="careers-numbers">
            {PERKS.map((perk) => (
              <div
                key={perk.title}
                className="careers-number"
                style={
                  {
                    "--careers-number-pad": perk.pad,
                    "--careers-numeral-ratio": perk.numeralRatio,
                  } as CSSProperties
                }
                data-fx={perk.fx}
                data-fx-devices="desktop"
              >
                <span className="careers-number__numeral" aria-hidden="true">
                  {perk.numeral}
                </span>
                <IconBox
                  icon={perk.icon}
                  title={perk.title}
                  style={
                    {
                      "--w-iconbox-icon-size": perk.iconSize,
                      "--w-iconbox-icon-color": "var(--color-accent-1)",
                      "--w-iconbox-gap": "0px",
                    } as CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
