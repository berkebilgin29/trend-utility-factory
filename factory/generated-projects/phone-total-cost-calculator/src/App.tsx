import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Download, RefreshCcw, Share2 } from "lucide-react";
import { toPng } from "html-to-image";

type Values = {
  phonePrice: number;
  downPayment: number;
  installmentCount: number;
  interestRate: number;
  accessoryCost: number;
};

type Result = {
  financedAmount: number;
  interestCost: number;
  monthlyPayment: number;
  totalCost: number;
  extraCost: number;
};

const STORAGE_KEY = "trend-utility:phone-total-cost-calculator";

const defaultValues: Values = {
  phonePrice: 899,
  downPayment: 150,
  installmentCount: 24,
  interestRate: 8,
  accessoryCost: 80
};

const faqs = [
  {
    question: "How does the phone installment calculator work?",
    answer: "It subtracts the down payment from the phone price, adds a simple interest estimate to the financed amount, then spreads that amount across the installment count."
  },
  {
    question: "Does the total cost include accessories?",
    answer: "Yes. Add cases, chargers, protection plans, setup fees, or other upfront accessories in the accessory cost field."
  },
  {
    question: "Why compare extra cost vs cash price?",
    answer: "The extra cost helps show how much more the payment plan may cost compared with paying the phone price upfront."
  },
  {
    question: "Is this the exact price from a carrier or lender?",
    answer: "No. Real offers may include taxes, activation fees, monthly service plans, different interest formulas, and promotional credits."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Phone Installment and Total Cost Calculator",
  description: "Estimate monthly phone payments, total phone cost, and extra cost versus cash price before choosing an installment plan.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: ["Monthly phone payment", "Total phone cost", "Extra cost versus cash price", "Accessory cost estimate"],
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer }
  }))
};

function readStoredValues(): Values {
  if (typeof window === "undefined") return defaultValues;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultValues, ...JSON.parse(stored) } : defaultValues;
  } catch {
    return defaultValues;
  }
}

function App() {
  const [values, setValues] = useState<Values>(readStoredValues);
  const cardRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => calculatePhoneCost(values), [values]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  function updateValue(key: keyof Values, value: number) {
    setValues((current) => ({ ...current, [key]: Math.max(0, value) }));
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#f8fafc" });
    const link = document.createElement("a");
    link.download = "phone-total-cost-summary.png";
    link.href = dataUrl;
    link.click();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 md:grid-cols-[1fr_0.85fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <Calculator size={16} />
              phone payment planner
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 md:text-4xl">
              Phone Installment and Total Cost Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Estimate your monthly phone payment, total amount paid, and extra cost versus cash price before choosing an installment plan.
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Phone cost details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the phone price, upfront payment, financing length, interest rate, and accessory costs. The calculator uses a simple estimate so you can compare offers quickly.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <NumberField label="Phone price" value={values.phonePrice} onChange={(value) => updateValue("phonePrice", value)} prefix="$" />
              <NumberField label="Down payment" value={values.downPayment} onChange={(value) => updateValue("downPayment", value)} prefix="$" />
              <NumberField label="Installment count" value={values.installmentCount} onChange={(value) => updateValue("installmentCount", value)} suffix="months" />
              <NumberField label="Interest rate" value={values.interestRate} onChange={(value) => updateValue("interestRate", value)} suffix="%" />
              <NumberField label="Accessory cost" value={values.accessoryCost} onChange={(value) => updateValue("accessoryCost", value)} prefix="$" />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">FAQ</h2>
            <div className="mt-3 grid gap-3">
              {faqs.map((item) => (
                <details key={item.question} className="rounded-md border border-slate-200 p-3">
                  <summary className="cursor-pointer font-medium">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 md:sticky md:top-5 md:self-start">
          <section ref={cardRef} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Payment estimate</h2>
              <Share2 size={20} className="text-emerald-600" />
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">Estimated monthly payment</p>
            <p className="mt-1 text-4xl font-bold text-slate-950">{formatCurrency(result.monthlyPayment)}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <ResultRow label="Financed amount" value={formatCurrency(result.financedAmount)} />
              <ResultRow label="Estimated interest cost" value={formatCurrency(result.interestCost)} />
              <ResultRow label="Accessory cost" value={formatCurrency(values.accessoryCost)} />
              <ResultRow label="Estimated total cost" value={formatCurrency(result.totalCost)} strong />
              <ResultRow label="Extra cost vs cash price" value={formatCurrency(result.extraCost)} strong />
            </dl>
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-3 text-sm leading-6 text-emerald-900">
              Share card: {formatCurrency(result.monthlyPayment)} per month for {Math.max(1, values.installmentCount)} months, with an estimated total of {formatCurrency(result.totalCost)}.
            </p>
          </section>

          <div className="flex gap-3">
            <button onClick={downloadCard} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              <Download size={18} />
              Download
            </button>
            <button onClick={() => setValues(defaultValues)} className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-700" aria-label="Reset values">
              <RefreshCcw size={18} />
            </button>
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            This calculator is for planning only and is not financial advice. Confirm official installment terms, taxes, fees, promotional credits, interest rules, and carrier charges before buying.
          </p>
        </aside>
      </section>
    </main>
  );
}

function NumberField(props: { label: string; value: number; onChange: (value: number) => void; prefix?: string; suffix?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {props.label}
      <span className="flex items-center rounded-md border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
        {props.prefix ? <span className="pl-3 text-slate-500">{props.prefix}</span> : null}
        <input
          className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-3 text-base text-slate-950 outline-none"
          type="number"
          inputMode="decimal"
          value={props.value}
          onChange={(event) => props.onChange(Number(event.target.value))}
        />
        {props.suffix ? <span className="pr-3 text-slate-500">{props.suffix}</span> : null}
      </span>
    </label>
  );
}

function ResultRow(props: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-slate-100 px-3 py-3">
      <dt className="text-slate-600">{props.label}</dt>
      <dd className={props.strong ? "text-base font-semibold text-slate-950" : "font-medium text-slate-900"}>{props.value}</dd>
    </div>
  );
}

function calculatePhoneCost(values: Values): Result {
  const phonePrice = Math.max(0, values.phonePrice);
  const downPayment = Math.min(Math.max(0, values.downPayment), phonePrice);
  const installmentCount = Math.max(1, Math.round(values.installmentCount));
  const interestRate = Math.max(0, values.interestRate);
  const accessoryCost = Math.max(0, values.accessoryCost);
  const financedAmount = Math.max(0, phonePrice - downPayment);
  const interestCost = financedAmount * (interestRate / 100);
  const financedTotal = financedAmount + interestCost;
  const monthlyPayment = financedTotal / installmentCount;
  const totalCost = downPayment + financedTotal + accessoryCost;
  const cashPriceWithAccessories = phonePrice + accessoryCost;
  const extraCost = Math.max(0, totalCost - cashPriceWithAccessories);

  return { financedAmount, interestCost, monthlyPayment, totalCost, extraCost };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export default App;
