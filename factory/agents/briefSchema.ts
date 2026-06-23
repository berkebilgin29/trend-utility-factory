import { readFileSync } from "node:fs";
import { z } from "zod";

export const productTypes = [
  "calculator",
  "generator",
  "checklist",
  "tracker",
  "simulator",
  "planner",
  "quiz",
  "converter",
  "tier-list-maker",
  "share-card-maker"
] as const;

export const inputSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  label: z.string().min(2),
  type: z.enum(["number", "text", "select", "checkbox"]),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional()
});

export const outputSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  label: z.string().min(2),
  description: z.string().optional()
});

export const faqSchema = z.object({
  question: z.string().min(8),
  answer: z.string().min(12)
});

export const briefSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  productType: z.enum(productTypes),
  title: z.string().min(8),
  description: z.string().min(20),
  keywords: z.array(z.string().min(2)).min(3).max(12),
  audience: z.string().min(5),
  trendAngle: z.string().min(10),
  features: z.array(z.string().min(3)).min(2).max(8),
  inputs: z.array(inputSchema).min(1).max(12),
  outputs: z.array(outputSchema).min(1).max(6),
  faq: z.array(faqSchema).min(2).max(6),
  disclaimer: z.string().min(10)
});

export type ProductType = (typeof productTypes)[number];
export type Brief = z.infer<typeof briefSchema>;

export function loadBrief(path: string): Brief {
  const raw = readFileSync(path, "utf8");
  return briefSchema.parse(JSON.parse(raw));
}

