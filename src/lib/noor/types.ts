// Core domain types for Noor Journey. Router- and storage-independent.

export type Lang = "ml" | "en";
export type Text = { ml: string; en: string };

export type WorldId = "akhlaq" | "foundations" | "stories" | "everyday" | "practice";
export type SubjectId =
  | "language-script"
  | "aqaid"
  | "fiqh"
  | "taskiya-akhlaq"
  | "thariq"
  | "quran-studies"
  | "nahv-saraf";

export type PublishState = "draft" | "published-demo" | "archived";
export type ReviewStatus = "awaiting-educator-review" | "in-review" | "approved";

export interface Choice { id: string; text: Text }

export interface ChoiceActivity {
  kind: "choice";
  id: string;
  prompt: Text;
  scenario?: Text | undefined;
  choices: Choice[];
  correctId: string;
  /** explanation shown after check; `wrong` keyed by choice id falls back to `wrongDefault` */
  explainCorrect: Text;
  explainWrong: Text;
  concept: Text;
}

export interface MatchActivity {
  kind: "match";
  id: string;
  prompt: Text;
  pairs: { id: string; left: Text; right: Text }[];
  explainCorrect: Text;
  explainWrong: Text;
  concept: Text;
}

export interface SequenceActivity {
  kind: "sequence";
  id: string;
  prompt: Text;
  /** steps in correct order */
  steps: { id: string; text: Text }[];
  explainCorrect: Text;
  explainWrong: Text;
  concept: Text;
}

export type Activity = ChoiceActivity | MatchActivity | SequenceActivity;

export interface Teaching {
  title: Text;
  body: Text[];
  arabic?: { text: string; transliteration: Text; meaning: Text };
}

export interface Mission {
  id: string;
  chapterId: string;
  order: number;
  title: Text;
  concept: Text;
  minutes: number;
  teaching: Teaching;
  activities: Activity[];
  /** pool of >= 8 questions; each checkpoint attempt draws 4 equivalent ones */
  checkpointPool: ChoiceActivity[];
  revision: ChoiceActivity[];
  family: Text;
  version: string;
  publish: PublishState;
  review: ReviewStatus;
  subject: SubjectId;
  objective: Text;
}

export interface Chapter {
  id: string;
  worldId: WorldId;
  title: Text;
  description: Text;
  learn: Text[];
  badge: { id: string; name: Text };
  missionIds: string[];
  playable: boolean;
}

export interface World {
  id: WorldId;
  title: Text;
  blurb: Text;
  subjects: SubjectId[];
  chapterIds: string[];
  playable: boolean;
  previewTopics: Text[];
}

// ---------- Persisted state ----------

export type AgeBand = "8-9" | "10-11" | "12-13";
export type PriorStandard = "none" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "not-sure";

export interface ChildProfile {
  id: string;
  nickname: string;
  ageBand: AgeBand;
  priorStandard: PriorStandard;
  avatarId: string;
  cosmeticId: string | null;
  weeklyGoal: 2 | 3 | 5;
  recommendedStart?: string;
  createdAt: number;
}

export interface MissionProgress {
  attempts: number;
  passedAt?: number;
  lastCheckpointScore?: number;
}

export interface ReviewItem {
  missionId: string;
  stage: number; // 0 => first review due at +1d, 1 => +3d, 2 => +7d
  dueAt: number;
  retained: boolean;
  lastReviewedAt?: number;
}

export interface XpTransaction {
  id: string; // deterministic, used for dedupe
  amount: number;
  reason: "mission" | "review" | "chapter-review";
  at: number;
}

export type SessionPhase = "teach" | "activity" | "checkpoint" | "checkpoint-failed" | "complete";

export interface MissionSession {
  missionId: string;
  phase: SessionPhase;
  activityIndex: number;
  checkpointAttempt: number;
  checkpointIndex: number;
  checkpointAnswers: { qid: string; correct: boolean }[];
}

export interface ChildProgress {
  missions: Record<string, MissionProgress>;
  reviews: Record<string, ReviewItem>;
  xp: XpTransaction[];
  badges: string[];
  chapterReviews: Record<string, number>; // chapterId -> passedAt
  sessions: number[]; // timestamps of finished learning sessions
  inFlight: MissionSession | null;
  reflections: { missionId: string; note: string; at: number }[];
}

export interface Preferences {
  lang: Lang;
  sound: boolean;
  reducedMotion: boolean;
}

export interface NoorState {
  version: 1;
  parentName: string | null;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  progress: Record<string, ChildProgress>;
  prefs: Preferences;
  dayOffset: number; // simulated date control (adult demo)
  simulateFailure: boolean;
}
