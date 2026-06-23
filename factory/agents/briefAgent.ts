import type { Brief } from "./briefSchema.js";

export function createExampleBrief(productType: Brief["productType"] = "calculator"): Brief {
  const examples: Record<Brief["productType"], Brief> = {
    calculator: {
      slug: "subscription-cost-calculator",
      productType: "calculator",
      title: "Subscription Cost Calculator",
      description: "Estimate monthly and annual subscription spend across streaming, AI, cloud, and creator tools.",
      keywords: ["subscription calculator", "monthly cost", "budget tool", "saas spend"],
      audience: "People auditing recurring digital subscriptions",
      trendAngle: "Consumers are trimming recurring AI, streaming, and creator-tool subscriptions.",
      features: ["Monthly total", "Annual projection", "Quick share card"],
      inputs: [
        { id: "streaming", label: "Streaming apps monthly cost", type: "number", defaultValue: 25 },
        { id: "ai-tools", label: "AI tools monthly cost", type: "number", defaultValue: 20 },
        { id: "cloud-apps", label: "Cloud and creator tools monthly cost", type: "number", defaultValue: 15 }
      ],
      outputs: [
        { id: "monthly-total", label: "Monthly total" },
        { id: "annual-total", label: "Annual total" }
      ],
      faq: [
        { question: "What subscriptions should I include?", answer: "Include any recurring app, streaming, cloud, AI, creator, or membership payment." },
        { question: "Is this financial advice?", answer: "No. It is a simple planning estimate to help you review recurring costs." }
      ],
      disclaimer: "This calculator is for planning only and is not financial advice."
    },
    generator: {
      slug: "creator-caption-generator",
      productType: "generator",
      title: "Creator Caption Generator",
      description: "Generate compact caption ideas for short-form posts, tutorials, launch notes, and trend reactions.",
      keywords: ["caption generator", "creator tool", "social post ideas", "short-form content"],
      audience: "Creators and small teams publishing quick posts",
      trendAngle: "Short-form creators need fast reusable post angles without copying brand language.",
      features: ["Caption angle", "Hook starter", "Shareable output"],
      inputs: [
        { id: "topic", label: "Post topic", type: "text", placeholder: "AI notes, desk setup, budget habit" },
        { id: "tone", label: "Tone", type: "select", options: ["Practical", "Playful", "Direct"], defaultValue: "Practical" }
      ],
      outputs: [{ id: "caption", label: "Caption draft" }],
      faq: [
        { question: "Can I use this for any niche?", answer: "Yes, keep the topic specific and adjust the final wording to your audience." },
        { question: "Does it call an AI API?", answer: "No. The default factory output uses local deterministic templates." }
      ],
      disclaimer: "Review generated copy before publishing and avoid copying protected brand language."
    },
    checklist: {
      slug: "ai-meeting-readiness-checklist",
      productType: "checklist",
      title: "AI Meeting Readiness Checklist",
      description: "Check whether a meeting has enough context, decisions, and follow-up structure for useful AI notes.",
      keywords: ["meeting checklist", "AI notes", "meeting prep", "productivity"],
      audience: "Remote teams using AI note takers or meeting summaries",
      trendAngle: "Teams are adopting AI meeting tools but still need better meeting inputs.",
      features: ["Readiness score", "Missing prep items", "Printable checklist"],
      inputs: [
        { id: "agenda", label: "Clear agenda", type: "checkbox", defaultValue: true },
        { id: "decision", label: "Decision needed is stated", type: "checkbox", defaultValue: false },
        { id: "owners", label: "Owners are assigned", type: "checkbox", defaultValue: false }
      ],
      outputs: [{ id: "readiness", label: "Readiness score" }],
      faq: [
        { question: "Who is this checklist for?", answer: "It is for anyone preparing meetings that will be summarized or actioned later." },
        { question: "Does it replace meeting notes?", answer: "No. It helps improve the structure before notes are captured." }
      ],
      disclaimer: "This checklist is a productivity aid, not a compliance or legal record."
    },
    tracker: {
      slug: "focus-session-tracker",
      productType: "tracker",
      title: "Focus Session Tracker",
      description: "Track daily deep-work sessions, interruptions, and completion confidence in a simple local tool.",
      keywords: ["focus tracker", "deep work", "productivity tracker", "habit tool"],
      audience: "Workers trying to protect focused time",
      trendAngle: "People are rebuilding focus routines around remote work and notification-heavy tools.",
      features: ["Session count", "Interruption estimate", "Local saved state"],
      inputs: [
        { id: "sessions", label: "Completed focus sessions", type: "number", defaultValue: 2 },
        { id: "interruptions", label: "Interruptions", type: "number", defaultValue: 3 }
      ],
      outputs: [{ id: "focus-score", label: "Focus score" }],
      faq: [
        { question: "Is my data uploaded?", answer: "No. The generated app stores values locally in the browser." },
        { question: "What counts as a session?", answer: "Use any focused block that feels meaningful for your work." }
      ],
      disclaimer: "This tracker is a personal productivity estimate only."
    },
    simulator: {
      slug: "habit-streak-simulator",
      productType: "simulator",
      title: "Habit Streak Simulator",
      description: "Simulate how weekly consistency affects a simple habit streak over the next month.",
      keywords: ["habit simulator", "streak planner", "consistency calculator", "routine tool"],
      audience: "People testing realistic habit goals",
      trendAngle: "Habit builders are shifting from perfect streaks to realistic consistency targets.",
      features: ["Projected completions", "Consistency score", "Share card"],
      inputs: [
        { id: "days", label: "Target days per week", type: "number", defaultValue: 4 },
        { id: "confidence", label: "Confidence from 1 to 10", type: "number", defaultValue: 7 }
      ],
      outputs: [{ id: "projection", label: "Monthly projection" }],
      faq: [
        { question: "Is this a prediction?", answer: "No. It is a simple scenario tool for planning a realistic target." },
        { question: "Can I change the habit?", answer: "Yes. Treat the labels as flexible and use it for any repeatable habit." }
      ],
      disclaimer: "This simulator is for personal planning only."
    },
    planner: {
      slug: "ai-meeting-agenda-planner",
      productType: "planner",
      title: "AI Meeting Agenda Planner",
      description: "Draft a structured meeting plan with goal, context, decision, and follow-up blocks.",
      keywords: ["meeting planner", "AI agenda", "agenda builder", "team productivity"],
      audience: "Teams preparing concise meetings",
      trendAngle: "AI-assisted work makes structured meeting inputs more valuable.",
      features: ["Agenda outline", "Decision prompt", "Follow-up section"],
      inputs: [
        { id: "topic", label: "Meeting topic", type: "text", placeholder: "Roadmap review" },
        { id: "duration", label: "Minutes available", type: "number", defaultValue: 30 }
      ],
      outputs: [{ id: "plan", label: "Meeting plan" }],
      faq: [
        { question: "Can this be used without AI tools?", answer: "Yes. It creates a human-readable agenda structure." },
        { question: "Does it connect to my calendar?", answer: "No. It runs locally and does not access external accounts." }
      ],
      disclaimer: "Review agendas for accuracy before sending to attendees."
    },
    quiz: {
      slug: "digital-declutter-score-quiz",
      productType: "quiz",
      title: "Digital Declutter Score Quiz",
      description: "Score your digital clutter across tabs, inboxes, subscriptions, files, and notification habits.",
      keywords: ["digital declutter", "productivity quiz", "inbox cleanup", "focus tool"],
      audience: "People reducing digital overload",
      trendAngle: "Digital minimalism is expanding from files into subscriptions, AI tools, and notifications.",
      features: ["Clutter score", "Next action", "Shareable result"],
      inputs: [
        { id: "tabs", label: "Open tabs", type: "number", defaultValue: 18 },
        { id: "inbox", label: "Unread inbox count", type: "number", defaultValue: 80 },
        { id: "notifications", label: "Notifications feel controlled", type: "checkbox", defaultValue: false }
      ],
      outputs: [{ id: "score", label: "Declutter score" }],
      faq: [
        { question: "What does the score mean?", answer: "It is a directional signal to help choose a cleanup starting point." },
        { question: "Does it inspect my files or inbox?", answer: "No. You enter values manually and nothing external is read." }
      ],
      disclaimer: "This quiz is a personal productivity aid and does not inspect private accounts or files."
    },
    converter: {
      slug: "creator-rate-converter",
      productType: "converter",
      title: "Creator Rate Converter",
      description: "Convert project fees into hourly, daily, and monthly planning equivalents for creator work.",
      keywords: ["rate converter", "creator pricing", "freelance calculator", "project fee"],
      audience: "Independent creators estimating project value",
      trendAngle: "More creators package services and need fast rate comparisons.",
      features: ["Hourly equivalent", "Daily equivalent", "Simple share card"],
      inputs: [
        { id: "fee", label: "Project fee", type: "number", defaultValue: 500 },
        { id: "hours", label: "Estimated hours", type: "number", defaultValue: 8 }
      ],
      outputs: [{ id: "rate", label: "Converted rate" }],
      faq: [
        { question: "Is this pricing advice?", answer: "No. It is a calculator for comparing your own estimates." },
        { question: "Can I use different currencies?", answer: "Yes. The math works with any currency if you keep inputs consistent." }
      ],
      disclaimer: "This converter is for planning only and is not financial advice."
    },
    "tier-list-maker": {
      slug: "remote-work-tool-tier-list",
      productType: "tier-list-maker",
      title: "Remote Work Tool Tier List Maker",
      description: "Rank your remote-work tools by usefulness, focus impact, and team adoption.",
      keywords: ["tier list maker", "remote work tools", "productivity ranking", "tool audit"],
      audience: "Teams reviewing software usefulness",
      trendAngle: "Teams are consolidating tool stacks and ranking what actually helps.",
      features: ["Tier score", "Tool ranking", "Shareable card"],
      inputs: [
        { id: "tool", label: "Tool name", type: "text", placeholder: "Notes app" },
        { id: "usefulness", label: "Usefulness 1 to 10", type: "number", defaultValue: 7 },
        { id: "focus", label: "Focus impact 1 to 10", type: "number", defaultValue: 6 }
      ],
      outputs: [{ id: "tier", label: "Suggested tier" }],
      faq: [
        { question: "Is this an official ranking?", answer: "No. It helps you think through your own tool stack." },
        { question: "Can I rank multiple tools?", answer: "Generate one card at a time, then compare the results manually." }
      ],
      disclaimer: "Avoid using protected logos or brand assets in shared outputs."
    },
    "share-card-maker": {
      slug: "weekly-win-share-card-maker",
      productType: "share-card-maker",
      title: "Weekly Win Share Card Maker",
      description: "Create a simple share card for a weekly achievement, milestone, or personal progress update.",
      keywords: ["share card maker", "weekly wins", "progress update", "creator card"],
      audience: "Creators, students, and teams sharing progress",
      trendAngle: "People are turning small wins into lightweight visual updates.",
      features: ["Share card", "Download image", "Local-only editing"],
      inputs: [
        { id: "win", label: "Weekly win", type: "text", placeholder: "Shipped a mini tool" },
        { id: "mood", label: "Mood", type: "select", options: ["Focused", "Proud", "Learning"], defaultValue: "Focused" }
      ],
      outputs: [{ id: "card", label: "Share card" }],
      faq: [
        { question: "Can I download the card?", answer: "Yes. Use the download button in the generated app." },
        { question: "Are images uploaded?", answer: "No. The card is rendered in your browser." }
      ],
      disclaimer: "Do not include private, confidential, or protected brand content in public cards."
    }
  };

  return examples[productType];
}

export function createDailyMockBriefs(): Brief[] {
  return [
    createExampleBrief("planner"),
    createExampleBrief("calculator"),
    createExampleBrief("checklist"),
    createExampleBrief("generator"),
    createExampleBrief("quiz")
  ];
}

