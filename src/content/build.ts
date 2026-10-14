// Compact builders for authoring bilingual fixtures.
import type { ChoiceActivity, MatchActivity, SequenceActivity, Text } from "@/lib/noor/types";

export type T = [ml: string, en: string];
export const tx = ([ml, en]: T): Text => ({ ml, en });

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** deterministic order so SSR / reload show the same layout */
export function stableShuffle<X>(items: X[], seed: string): X[] {
  return items
    .map((it, i) => ({ it, k: hash(seed + ":" + i) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.it);
}

export function choice(
  id: string,
  concept: T,
  prompt: T,
  options: [correct: T, ...wrong: T[]],
  explainCorrect: T,
  explainWrong: T,
  scenario?: T,
): ChoiceActivity {
  const choices = options.map((o, i) => ({ id: `${id}-${i}`, text: tx(o) }));
  return {
    kind: "choice",
    id,
    concept: tx(concept),
    prompt: tx(prompt),
    scenario: scenario ? tx(scenario) : undefined,
    choices: stableShuffle(choices, id),
    correctId: `${id}-0`,
    explainCorrect: tx(explainCorrect),
    explainWrong: tx(explainWrong),
  };
}

export function match(
  id: string,
  concept: T,
  prompt: T,
  pairs: [T, T][],
  explainCorrect: T,
  explainWrong: T,
): MatchActivity {
  return {
    kind: "match",
    id,
    concept: tx(concept),
    prompt: tx(prompt),
    pairs: pairs.map(([l, r], i) => ({ id: `${id}-${i}`, left: tx(l), right: tx(r) })),
    explainCorrect: tx(explainCorrect),
    explainWrong: tx(explainWrong),
  };
}

export function sequence(
  id: string,
  concept: T,
  prompt: T,
  steps: T[],
  explainCorrect: T,
  explainWrong: T,
): SequenceActivity {
  return {
    kind: "sequence",
    id,
    concept: tx(concept),
    prompt: tx(prompt),
    steps: steps.map((s, i) => ({ id: `${id}-${i}`, text: tx(s) })),
    explainCorrect: tx(explainCorrect),
    explainWrong: tx(explainWrong),
  };
}
