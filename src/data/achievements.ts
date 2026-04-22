import { medalDefinitions, type MedalDefinition } from "@/data/immersive-content";

export type AchievementProgressRow = {
  simulationCode: string;
  simulationStatus: string;
  offerAccepted: boolean;
  title: string;
  orderIndex: number;
  status: string;
  score: number | null;
  submissionQuality: string | null;
  submittedAt: string | null;
  selfEvalSubmitted: boolean;
};

export type AchievementState = MedalDefinition & {
  unlocked: boolean;
  unlockedAt?: string;
};

const rarityRank: Record<string, number> = {
  "史诗": 0,
  "稀有": 1,
  "普通": 2,
};

export const buildAchievementStates = (rows: AchievementProgressRow[]) => {
  const doneRows = rows.filter((row) => row.status === "done");
  const touchedCodes = new Set(doneRows.map((row) => row.simulationCode));
  const completedSimulations = new Set(
    rows.filter((row) => row.simulationStatus === "completed").map((row) => row.simulationCode),
  );
  const validSubmissions = rows.filter((row) => row.submissionQuality === "pass" && row.submittedAt);
  const selfEvalCount = rows.filter((row) => row.selfEvalSubmitted).length;

  const findUnlockTime = (predicate: (row: AchievementProgressRow) => boolean) =>
    rows.find((row) => predicate(row))?.submittedAt ?? undefined;

  const states: AchievementState[] = medalDefinitions.map((medal) => {
    switch (medal.id) {
      case "entry":
        return { ...medal, unlocked: doneRows.some((row) => row.orderIndex === 0), unlockedAt: findUnlockTime((row) => row.status === "done" && row.orderIndex === 0) };
      case "ontime":
        return { ...medal, unlocked: validSubmissions.length >= 5, unlockedAt: validSubmissions[4]?.submittedAt ?? validSubmissions.at(-1)?.submittedAt };
      case "working-paper":
        return { ...medal, unlocked: rows.some((row) => row.simulationCode === "ibd-ipo" && row.orderIndex === 2 && typeof row.score === "number" && row.score >= 85), unlockedAt: findUnlockTime((row) => row.simulationCode === "ibd-ipo" && row.orderIndex === 2 && typeof row.score === "number" && row.score >= 85) };
      case "first-memo":
        return { ...medal, unlocked: rows.some((row) => row.simulationCode === "pe-growth" && row.orderIndex === 2 && row.status === "done"), unlockedAt: findUnlockTime((row) => row.simulationCode === "pe-growth" && row.orderIndex === 2 && row.status === "done") };
      case "sector-insight":
        return { ...medal, unlocked: rows.some((row) => row.simulationCode === "er-new-energy" && typeof row.score === "number" && row.score >= 90), unlockedAt: findUnlockTime((row) => row.simulationCode === "er-new-energy" && typeof row.score === "number" && row.score >= 90) };
      case "three-angles":
        return { ...medal, unlocked: touchedCodes.size >= 3, unlockedAt: doneRows.at(-1)?.submittedAt };
      case "self-aware":
        return { ...medal, unlocked: selfEvalCount >= 8, unlockedAt: rows.filter((row) => row.selfEvalSubmitted).at(7)?.submittedAt };
      case "full-close":
        return { ...medal, unlocked: completedSimulations.size >= 1, unlockedAt: findUnlockTime((row) => row.simulationStatus === "completed") };
      default:
        return { ...medal, unlocked: false };
    }
  });

  return states.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return rarityRank[a.rarity] - rarityRank[b.rarity];
  });
};
