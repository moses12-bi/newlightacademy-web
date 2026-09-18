"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const features = [
  { title: "A Caring Environment", text: "Children are welcomed warmly, known by name and encouraged to settle in happily from their very first day.", image: "/images/school/nursery-group-small.jpg" },
  { title: "Christian Values", text: `Our crest carries the motto “${site.motto}”. Faith, kindness and good character shape the way we treat one another.`, image: "/images/school/nursery-graduation-gowns.jpg" },
  { title: "National Curriculum", text: "We follow the Rwanda national curriculum from Baby Class through P6, preparing pupils for the Primary Leaving Examination.", image: "/images/school/pupils-with-certificates.jpg" },
  { title: "An Inclusive School", text: "We are accredited by NESA, and we work to give every learner an inclusive education in which each child can take part.", image: "/images/school/primary-pupils-group.jpg" },
] as const;

export default function HomeExperience() {
  const [active, setActive] = useState(0);
  /* The rotation is auto-updating content, so it needs a way to stop it
     (WCAG 2.2.2). It also holds while the pointer or the keyboard is inside the
     widget, so a panel cannot change out from under whoever is reading it. */
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  /* Fixed ids: this widget appears once, on the home page. */
  const tabId = (index: number) => `home-feature-tab-${index}`;
  const panelId = "home-feature-panel";

  useEffect(() => {
    if (paused || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % features.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, held, active]);

  /* Roving tabindex: only the selected tab is a tab stop, and the arrow keys
     move between them — the behaviour role="tablist" promises. */
  const select = useCallback((index: number) => {
    const next = (index + features.length) % features.length;
    setActive(next);
    const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    buttons?.[next]?.focus();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(features.length - 1);
    }
  };

  return (
    <div
      className="home-experience"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="home-tabs-col">
        <div
          ref={tabsRef}
          className="home-tabs"
          role="tablist"
          aria-label={`What makes ${site.name} special`}
          onKeyDown={onKeyDown}
        >
          {features.map((feature, index) => (
            <button
              key={feature.title}
              id={tabId(index)}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls={panelId}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              className="home-tab"
            >
              <span>{index + 1}.</span>
              {feature.title}
            </button>
          ))}
        </div>
        <button type="button" className="home-tabs-pause" onClick={() => setPaused((value) => !value)}>
          {paused ? "Play the slideshow" : "Pause the slideshow"}
        </button>
      </div>
      <div
        id={panelId}
        role="tabpanel"
        tabIndex={-1}
        aria-labelledby={tabId(active)}
        className="home-feature-panel"
      >
        <Image key={features[active].image} src={features[active].image} alt="Children learning and playing" width={1300} height={800} sizes="(min-width: 1025px) 58vw, 100vw" className="home-feature-image" />
        <div className="home-feature-caption"><h3>{features[active].title}</h3><p>{features[active].text}</p></div>
      </div>
    </div>
  );
}
