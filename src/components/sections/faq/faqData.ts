import { site } from "@/lib/site";

/**
 * The six accordion groups on /faq — post-1068 #6ce37b5, #ea24a89, #888c970,
 * #1e8355a, #d45a0c7 and #7204413.
 *
 * The saved page carried another school's answers: US drop-off procedures,
 * cafeteria prices, uniform retailers, named commercial reading schemes and
 * immunisation rules. None of it is true of this school, so the copy below is
 * written from what the school itself publishes — nursery and primary, NESA
 * accreditation, the Rwanda national curriculum and the PLE — and every
 * question that could only be answered with a fact we do not hold (fees, term
 * dates, uniform, meals, transport, class sizes, medical arrangements) has
 * either been dropped or turned into an honest "ask the school" answer.
 *
 * The group count, the group order and the four entries per group are the saved
 * ones, so the table of contents and the accordion keep their proportions.
 */
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface FaqGroup {
  /** Anchor target, also used by the table of contents. */
  id: string;
  title: string;
  entries: FaqEntry[];
}

/** Used wherever the only honest answer is "the office will tell you". */
const ASK_THE_OFFICE =
  "These details are confirmed by the school office, and that is the only place to get them right. Please contact us and we will give you the current information before your child starts.";

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "about-the-school",
    title: "About the school",
    entries: [
      {
        id: "about-the-school-1",
        question: "What kind of school is this?",
        answer: `${site.name} is a private day school in Kigali offering nursery (pre-primary) and primary education. Children can join us in nursery and stay with us all the way through primary.`,
      },
      {
        id: "about-the-school-2",
        question: "Is the school accredited?",
        answer:
          "Yes. The school is accredited by NESA, Rwanda's National Examination and School Inspection Authority, for both pre-primary and primary education.",
      },
      {
        id: "about-the-school-3",
        question: "Is this a Christian school?",
        answer: `Yes. ${site.name} is a Christian school, and our crest carries the motto “${site.motto}”. Faith shapes the way we care for children and the way we ask them to treat one another, and families from across our community are welcome here.`,
      },
      {
        id: "about-the-school-4",
        question: "Where are you, and how do we find you?",
        answer:
          "We are in Kinyinya sector, Gasabo district, in Kigali. The nearest landmark most families know is the Kinyinya bus station. If you would like directions before you visit, contact us and we will help you find us.",
      },
    ],
  },
  {
    id: "nursery",
    title: "Nursery",
    entries: [
      {
        id: "nursery-1",
        question: "Which nursery classes do you offer?",
        answer:
          "Our nursery has three levels: Baby Class, Middle Class and Top Class. Children are usually around three to four years old in Baby Class, four to five in Middle Class and five to six in Top Class.",
      },
      {
        id: "nursery-2",
        question: "Which class would my child join?",
        answer:
          "Most children join the class that matches their age, but no two children are the same. Talk to us about your child and we will agree together where they will settle best.",
      },
      {
        id: "nursery-3",
        question: "What will my child be learning in nursery?",
        answer:
          "We encourage active learning, curiosity and the development of strong foundational skills, so that children grow in confidence and are ready for P1 when the time comes.",
      },
      {
        id: "nursery-4",
        question: "How do you help a young child settle in?",
        answer:
          "Starting school is a big step for a small child, and for their parents. Tell us what your child enjoys, what worries them and what helps them feel safe, and we will do what we can to make those first days gentle ones.",
      },
    ],
  },
  {
    id: "primary",
    title: "Primary",
    entries: [
      {
        id: "primary-1",
        question: "Which primary classes do you offer?",
        answer:
          "We teach the full primary range, from P1 through to P6, so a child who joins us in nursery can complete their primary education with us.",
      },
      {
        id: "primary-2",
        question: "What curriculum do you follow?",
        answer:
          "We follow the Rwanda national curriculum. That gives your child the same foundation as pupils across the country, and it keeps the move to the next stage of their education straightforward.",
      },
      {
        id: "primary-3",
        question: "Do pupils sit the Primary Leaving Examination?",
        answer:
          "Yes. Pupils are prepared for the Primary Leaving Examination (PLE) at the end of P6, and we work alongside families through that year so that no one faces it alone.",
      },
      {
        id: "primary-4",
        question: "Can my child join partway through primary?",
        answer:
          "Children do move schools, and we are glad to talk about it. Contact us with your child's age and the class they are in now, and we will tell you honestly what is possible.",
      },
    ],
  },
  {
    id: "learning-and-care",
    title: "Learning and care",
    entries: [
      {
        id: "learning-and-care-1",
        question: "How do children learn here?",
        answer:
          "We encourage active learning, curiosity and the development of strong foundational skills. Children are asked to think, to try, to ask questions, and to keep going when something is hard.",
      },
      {
        id: "learning-and-care-2",
        question: "What do you mean when you say the school is inclusive?",
        answer:
          "We describe ourselves as an inclusive school, and we want to empower learners to have an inclusive education. Every child arrives with something different, so the honest answer is to talk to us about your own child before they start, and we will tell you plainly what we can offer.",
      },
      {
        id: "learning-and-care-3",
        question: "How do you look after a child's character and faith?",
        answer: `Our motto is “${site.motto}”, and it is more than decoration on a crest. We want children to leave us kind, honest and respectful of the people around them, as well as able to read, write and reason.`,
      },
      {
        id: "learning-and-care-4",
        question: "How will I know how my child is getting on?",
        answer:
          "Parents should never have to guess. Speak to your child's teacher, or contact the school office, whenever you want to know how things are going — you do not need to wait to be asked.",
      },
    ],
  },
  {
    id: "admissions",
    title: "Admissions",
    entries: [
      {
        id: "admissions-1",
        question: "How do we apply for a place?",
        answer:
          "Start by getting in touch. Tell us your child's age and the class you have in mind, and we will talk you through what happens next. The How to Apply page sets out the steps.",
      },
      {
        id: "admissions-2",
        question: "When can we apply?",
        answer:
          "Contact the school and we will tell you which places are open at the moment and when the next intake is. We would rather give you the current answer than publish one that goes out of date.",
      },
      {
        id: "admissions-3",
        question: "Can we visit before we decide?",
        answer:
          "A school is best judged by walking around it. Contact the school office to ask about visiting, and they will tell you what is possible.",
      },
      {
        id: "admissions-4",
        question: "What will you need to know about my child?",
        answer:
          "At this stage, very little: a way to reach you, your child's age, and the class you are thinking of. Anything else, we would rather ask you ourselves.",
      },
    ],
  },
  {
    id: "practical-questions",
    title: "Practical questions",
    entries: [
      {
        id: "practical-questions-1",
        question: "When does the school year start and finish?",
        answer: ASK_THE_OFFICE,
      },
      {
        id: "practical-questions-2",
        question: "Where do we find out about fees, uniform and the school day?",
        answer:
          "These can change from one year to the next, so we do not publish them here where they would quickly be out of date. Contact the school and we will give you the current arrangements in full.",
      },
      {
        id: "practical-questions-3",
        question: "How do we get in touch?",
        answer:
          "Our phone number, email address and location are on the Location page. Whichever way is easiest for you is the right one.",
      },
      {
        id: "practical-questions-4",
        question: "My question is not answered here. What now?",
        answer:
          "Ask us. No question about your own child is too small, and we would far rather answer it than leave you wondering.",
      },
    ],
  },
];
