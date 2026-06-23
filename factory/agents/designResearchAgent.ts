export type DesignPattern = {
  name: string;
  useWhen: string;
  layout: string;
  mobileRule: string;
  avoid: string;
};

export type DesignResearchReport = {
  sourceMode: "local-pattern-library";
  patterns: DesignPattern[];
  rules: string[];
};

export function researchDesignPatterns(): DesignResearchReport {
  return {
    sourceMode: "local-pattern-library",
    patterns: [
      {
        name: "Utility calculator split view",
        useWhen: "The app has several inputs and a numeric result.",
        layout: "Inputs on the left, sticky result card on desktop, result below inputs on mobile.",
        mobileRule: "Keep inputs full-width with large touch targets and avoid side-by-side fields below 640px.",
        avoid: "Do not hide the result behind tabs or decorative cards."
      },
      {
        name: "Checklist readiness flow",
        useWhen: "The app helps users decide whether they are prepared.",
        layout: "Short explanation, grouped checklist, readiness score, then FAQ/disclaimer.",
        mobileRule: "Checkboxes should be easy to tap and labels should wrap cleanly.",
        avoid: "Do not make checklist items tiny or rely only on color."
      },
      {
        name: "Planner output summary",
        useWhen: "The app turns constraints into a plan or schedule.",
        layout: "Collect constraints first, show a compact plan summary and next action.",
        mobileRule: "Prioritize the first actionable output above long explanatory text.",
        avoid: "Do not create a marketing hero instead of the actual planner."
      },
      {
        name: "Quiz recommendation card",
        useWhen: "The app chooses a category or recommendation.",
        layout: "Questions first, visible recommendation card, short reasons, FAQ.",
        mobileRule: "Keep question controls simple and avoid dense multi-column options.",
        avoid: "Do not imply official ranking or brand endorsement."
      }
    ],
    rules: [
      "Use real utility output above decorative content.",
      "Use restrained colors and clear information hierarchy.",
      "Do not copy brands, logos, or proprietary layouts.",
      "Make the first viewport show what the tool does and at least one usable input or result.",
      "Keep mobile controls full-width and readable."
    ]
  };
}

