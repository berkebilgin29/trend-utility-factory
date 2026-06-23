import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCcw, Share2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";

type FieldValue = string | number | boolean;
type InputDefinition = {
  id: string;
  label: string;
  type: "number" | "text" | "select" | "checkbox";
  placeholder?: string;
  options?: string[];
  defaultValue?: FieldValue;
};
type OutputDefinition = { id: string; label: string; description?: string };
type FaqItem = { question: string; answer: string };
type BriefData = {
  slug: string;
  productType: string;
  title: string;
  description: string;
  keywords: string[];
  audience: string;
  trendAngle: string;
  features: string[];
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  faq: FaqItem[];
  disclaimer: string;
};

const brief = {
  "slug": "travel-packing-checklist",
  "productType": "checklist",
  "title": "Travel Packing Checklist",
  "description": "Generate a practical packing checklist based on trip length, expected weather, and travel type.",
  "keywords": [
    "travel packing checklist",
    "packing list generator",
    "vacation packing checklist"
  ],
  "audience": "Travelers preparing for vacations, work trips, weekend breaks, and family travel",
  "trendAngle": "People are searching for faster personalized packing lists as travel rebounds and baggage fees stay high.",
  "features": [
    "Trip-based checklist",
    "Weather-aware packing prompts",
    "Travel-type reminder score",
    "Printable checklist style"
  ],
  "inputs": [
    {
      "id": "trip-days",
      "label": "Trip length in days",
      "type": "number",
      "defaultValue": 5
    },
    {
      "id": "weather",
      "label": "Expected weather",
      "type": "select",
      "options": [
        "Warm",
        "Cold",
        "Rainy",
        "Mixed"
      ],
      "defaultValue": "Mixed"
    },
    {
      "id": "travel-type",
      "label": "Travel type",
      "type": "select",
      "options": [
        "Vacation",
        "Business",
        "Family",
        "Weekend"
      ],
      "defaultValue": "Vacation"
    },
    {
      "id": "carry-on-only",
      "label": "Carry-on only",
      "type": "checkbox",
      "defaultValue": false
    }
  ],
  "outputs": [
    {
      "id": "packing-score",
      "label": "Packing readiness score"
    },
    {
      "id": "packing-reminders",
      "label": "Packing reminder list"
    }
  ],
  "faq": [
    {
      "question": "Can this replace a full travel checklist?",
      "answer": "It gives a fast starting point, but you should still add destination-specific items, documents, medication, and chargers."
    },
    {
      "question": "Does this know airline baggage rules?",
      "answer": "No. Check your airline and destination rules before packing liquids, batteries, or restricted items."
    },
    {
      "question": "Is the list saved?",
      "answer": "The generated app stores your current checklist values locally in the browser."
    }
  ],
  "disclaimer": "This checklist is a planning aid only. Always verify airline, destination, weather, document, and safety requirements before travel."
} as BriefData;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Travel Packing Checklist",
  "description": "Generate a practical packing checklist based on trip length, expected weather, and travel type.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Trip-based checklist",
    "Weather-aware packing prompts",
    "Travel-type reminder score",
    "Printable checklist style"
  ],
  "audience": {
    "@type": "Audience",
    "audienceType": "Travelers preparing for vacations, work trips, weekend breaks, and family travel"
  },
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can this replace a full travel checklist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It gives a fast starting point, but you should still add destination-specific items, documents, medication, and chargers."
      }
    },
    {
      "@type": "Question",
      "name": "Does this know airline baggage rules?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Check your airline and destination rules before packing liquids, batteries, or restricted items."
      }
    },
    {
      "@type": "Question",
      "name": "Is the list saved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The generated app stores your current checklist values locally in the browser."
      }
    }
  ]
};
const STORAGE_KEY = "trend-utility:" + brief.slug;

type Result = {
  headline: string;
  detail: string;
  score: string;
};

function createDefaultValues(): Record<string, FieldValue> {
  return Object.fromEntries(
    brief.inputs.map((input) => {
      if (input.defaultValue !== undefined) return [input.id, input.defaultValue];
      if (input.type === "checkbox") return [input.id, false];
      if (input.type === "number") return [input.id, 0];
      if (input.type === "select") return [input.id, input.options?.[0] ?? ""];
      return [input.id, ""];
    })
  );
}

function readStoredValues(): Record<string, FieldValue> {
  if (typeof window === "undefined") return createDefaultValues();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...createDefaultValues(), ...JSON.parse(stored) } : createDefaultValues();
  } catch {
    return createDefaultValues();
  }
}

function App() {
  const [values, setValues] = useState<Record<string, FieldValue>>(readStoredValues);
  const cardRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => computeResult(brief.productType, values), [values]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  function updateValue(id: string, value: FieldValue) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#f8fafc" });
    const link = document.createElement("a");
    link.download = brief.slug + "-share-card.png";
    link.href = dataUrl;
    link.click();
  }

  function resetValues() {
    setValues(createDefaultValues());
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_0.85fr] md:px-8">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <Sparkles size={16} />
              {brief.productType.split("-").join(" ")}
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 md:text-4xl">{brief.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{brief.description}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Inputs</h2>
            <div className="mt-4 grid gap-4">
              {brief.inputs.map((input) => (
                <label key={input.id} className="grid gap-2 text-sm font-medium text-slate-700">
                  {input.label}
                  {renderInput(input, values[input.id], updateValue)}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <div className="mt-3 grid gap-3">
              {brief.faq.map((item) => (
                <details key={item.question} className="rounded-md border border-slate-200 p-3">
                  <summary className="cursor-pointer font-medium">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div ref={cardRef} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Result</h2>
              <Share2 size={20} className="text-emerald-600" />
            </div>
            <p className="mt-5 text-3xl font-bold text-slate-950">{result.headline}</p>
            <p className="mt-3 text-base leading-7 text-slate-600">{result.detail}</p>
            <div className="mt-5 rounded-md bg-slate-100 p-4">
              <p className="text-sm font-medium text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-semibold">{result.score}</p>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-slate-600">
              {brief.features.map((feature) => (
                <li key={feature} className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">{feature}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadCard} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              <Download size={18} />
              Download
            </button>
            <button onClick={resetValues} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-700">
              <RefreshCcw size={18} />
            </button>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {brief.disclaimer}
          </div>
        </aside>
      </section>
    </main>
  );
}

function renderInput(input: InputDefinition, value: FieldValue | undefined, updateValue: (id: string, value: FieldValue) => void) {
  const baseClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
  if (input.type === "number") {
    return <input className={baseClass} type="number" value={Number(value ?? 0)} onChange={(event) => updateValue(input.id, Number(event.target.value))} />;
  }
  if (input.type === "checkbox") {
    return (
      <input
        className="h-6 w-6 rounded border-slate-300 text-emerald-600"
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => updateValue(input.id, event.target.checked)}
      />
    );
  }
  if (input.type === "select") {
    return (
      <select className={baseClass} value={String(value ?? "")} onChange={(event) => updateValue(input.id, event.target.value)}>
        {(input.options ?? []).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  }
  return <input className={baseClass} type="text" placeholder={input.placeholder} value={String(value ?? "")} onChange={(event) => updateValue(input.id, event.target.value)} />;
}

function computeResult(productType: string, values: Record<string, FieldValue>): Result {
  const numbers = Object.values(values)
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isFinite(value));
  const total = numbers.reduce((sum, value) => sum + value, 0);
  const checked = Object.values(values).filter((value) => value === true).length;
  const text = Object.values(values).filter((value) => typeof value === "string" && value.trim().length > 0).join(", ");

  if (productType === "calculator") {
    return { headline: "$" + total.toFixed(2) + " / month", detail: "Estimated annual impact: $" + (total * 12).toFixed(2) + ".", score: String(Math.round(total * 12)) };
  }
  if (productType === "checklist") {
    const checkboxCount = Math.max(1, brief.inputs.filter((input) => input.type === "checkbox").length);
    const percent = Math.round((checked / checkboxCount) * 100);
    return { headline: percent + "% ready", detail: percent >= 70 ? "You have the main pieces in place." : "Pick one missing item and improve it before sharing.", score: String(percent) };
  }
  if (productType === "quiz") {
    const score = Math.max(0, Math.min(100, 100 - Math.round(total / 2) + checked * 10));
    return { headline: score + "/100", detail: score >= 70 ? "Your setup looks controlled." : "Start with the highest-friction area and reduce one source of clutter.", score: String(score) };
  }
  if (productType === "converter") {
    const first = numbers[0] ?? 0;
    const second = Math.max(1, numbers[1] ?? 1);
    const rate = first / second;
    return { headline: rate.toFixed(2) + " per unit", detail: "Use this as a quick equivalent for comparing options.", score: rate.toFixed(2) };
  }
  if (productType === "tier-list-maker") {
    const average = numbers.length ? total / numbers.length : 0;
    const tier = average >= 8 ? "S" : average >= 6 ? "A" : average >= 4 ? "B" : "C";
    return { headline: "Tier " + tier, detail: "Ranking based on the scores you entered for " + (text || "this item") + ".", score: tier };
  }
  if (productType === "share-card-maker") {
    return { headline: text || "Your share card", detail: "Download this local browser-rendered card and post it where useful.", score: "Ready" };
  }
  if (productType === "planner" || productType === "generator") {
    return { headline: text || "Draft ready", detail: "Use the inputs as your starting point, then tighten the language before publishing.", score: String(Math.max(1, Math.round(total || checked || 1))) };
  }
  return { headline: String(Math.round(total + checked * 10)), detail: "Result generated from your current inputs.", score: String(Math.round(total + checked * 10)) };
}

export default App;
