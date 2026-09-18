interface ScheduleEntry {
  heading: string;
  /**
   * Optional: the school has not published start, finish or lesson times, and a
   * time printed here would read as a promise. Fill this in per entry once the
   * timetable is confirmed and the bold line renders itself again.
   */
  time?: string;
  note: string;
}

/**
 * #32e8e02 — the schedule blocks.
 *
 * The saved list was another school's timetable, down to its snack brands and
 * its allergy policy. None of that is true here, and we have not been told how
 * this school arranges its own day, so the blocks now describe nothing and send
 * the question to the school office instead.
 */
const SCHEDULE: ScheduleEntry[] = [
  {
    heading: "What we want from a school day",
    note: "Every class follows the Rwanda national curriculum, and we want each day to leave children feeling settled, curious and cared for.",
  },
  {
    heading: "Different for each class",
    note: "A day in Baby Class does not look like a day in P5, and pupils in the primary classes are working towards the Primary Leaving Examination at the end of P6. If you would like to know how a particular class spends its day, please ask the school office.",
  },
  {
    heading: "The timetable for your child",
    note: "We have not published start and finish times or a class timetable here. The school office can tell you the times for your child's class.",
  },
  {
    heading: "Ask us anything",
    note: "If you would like to know more about how a school day runs before you apply, please get in touch. Our phone number and email address are at the bottom of every page, and you are welcome to ask about visiting us and seeing a school day for yourself.",
  },
];

export default function DailyScheduleList() {
  return (
    <div className="daily__list">
      {SCHEDULE.map((entry, index) => (
        <div className="daily__item" key={`${entry.heading}-${index}`}>
          <h2>{entry.heading}</h2>
          {entry.time ? (
            <p className="daily__time">
              <strong>{entry.time}</strong>
            </p>
          ) : null}
          <p className="daily__note">{entry.note}</p>
        </div>
      ))}
    </div>
  );
}
